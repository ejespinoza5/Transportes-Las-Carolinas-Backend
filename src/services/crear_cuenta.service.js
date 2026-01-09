import bcrypt from 'bcryptjs';
import { crearCuentaModel } from '../models/crear_cuenta.model.js';
import { emailService } from '../utils/email.js';
import { validaciones } from '../utils/validaciones.js';

export const crearCuentaService = {
  async crearCuentaYCasillero(datosCompletos) {
    const {
      // Datos de usuario
      email,
      password,
      // Datos del casillero
      nombres,
      apellidos,
      cedula,
      celular,
      ciudad,
      provincia,
      cod_postal,
      tipo_entrega,
      direccion_casa,
      calle_secundaria,
      referencia
    } = datosCompletos;

    // Validaciones básicas
    if (!email || !password) {
      throw new Error('Email y contraseña son obligatorios');
    }

    // Validar formato de email
    if (!validaciones.esEmailValido(email)) {
      const sugerencia = validaciones.sugerirCorreccionEmail(email);
      if (sugerencia) {
        throw new Error(`El formato del email parece incorrecto. ¿Quisiste decir ${sugerencia}?`);
      }
      throw new Error('El formato del email no es válido. Verifica que esté escrito correctamente.');
    }

    if (!nombres || !apellidos || !cedula || !tipo_entrega) {
      throw new Error('Nombres, apellidos, cédula y tipo de entrega son obligatorios');
    }

    // Validar tipo de entrega
    if (!['domicilio', 'oficina'].includes(tipo_entrega)) {
      throw new Error('Tipo de entrega debe ser "domicilio" u "oficina"');
    }

    try {
      // 1. Verificar que el email no exista
      const emailExiste = await crearCuentaModel.verificarEmailExistente(email);
      if (emailExiste) {
        throw new Error('El email ya está registrado');
      }

      // 2. Verificar que la cédula no exista
      const cedulaExiste = await crearCuentaModel.verificarCedulaExistente(cedula);
      if (cedulaExiste) {
        throw new Error('La cédula ya está registrada');
      }

      // 3. Hash de la contraseña
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // 4. Crear el usuario con rol de cliente (id_rol = 2)
      // El email_verificado será FALSE por defecto
      const id_usuario = await crearCuentaModel.crearUsuario(email, passwordHash, 2);

      // 5. Obtener el siguiente código de casillero
      const cod_casillero = await crearCuentaModel.obtenerSiguienteCodCasillero();

      // 6. Crear el casillero del cliente
      const datosCasillero = {
        id_usuario,
        nombres,
        apellidos,
        cedula,
        celular,
        ciudad,
        provincia,
        cod_postal,
        cod_casillero,
        tipo_entrega,
        direccion_casa,
        calle_secundaria,
        referencia
      };

      const id_casillero = await crearCuentaModel.crearCasillero(datosCasillero);

      // 7. Generar y enviar código de verificación
      const codigoVerificacion = validaciones.generarCodigoVerificacion();
      
      try {
        // Guardar código en BD
        await crearCuentaModel.guardarCodigoVerificacion(email, codigoVerificacion);
        
        // Enviar código por email
        await emailService.enviarCodigoVerificacion(email, codigoVerificacion, nombres);
      } catch (emailError) {
        console.error('Error al enviar código de verificación:', emailError);
        // Continuamos, el usuario podrá solicitar otro código
      }

      return {
        success: true,
        message: 'Cuenta creada exitosamente. Por favor verifica tu correo electrónico.',
        data: {
          id_usuario,
          email,
          id_casillero,
          cod_casillero,
          nombres,
          apellidos,
          requiereVerificacion: true
        }
      };
    } catch (error) {
      // Si hay error, el rollback se maneja en el controlador si es necesario
      throw error;
    }
  },

  // Verificar código de verificación de email
  async verificarEmail(email, codigo) {
    try {
      // Verificar que el código sea válido
      const codigoValido = await crearCuentaModel.verificarCodigo(email, codigo);
      
      if (!codigoValido) {
        throw new Error('Código de verificación inválido o expirado');
      }

      // Marcar código como usado
      await crearCuentaModel.marcarCodigoUsado(codigoValido.id);

      // Marcar email como verificado
      await crearCuentaModel.marcarEmailVerificado(email);

      // Enviar correo de bienvenida
      try {
        // Obtener datos del casillero para el correo de bienvenida
        const query = `
          SELECT c.nombres, c.apellidos, c.cod_casillero, c.tipo_entrega, c.ciudad
          FROM casilleros_clientes c
          INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
          WHERE u.email = ?
        `;
        const { db } = await import('../config/db.js');
        const [rows] = await db.execute(query, [email]);
        
        if (rows.length > 0) {
          const datosCliente = rows[0];
          await emailService.enviarBienvenida(email, datosCliente);
        }
      } catch (emailError) {
        console.error('Error al enviar email de bienvenida:', emailError);
      }

      return {
        success: true,
        message: 'Email verificado correctamente. ¡Bienvenido!',
        emailVerificado: true
      };
    } catch (error) {
      throw error;
    }
  },

  // Reenviar código de verificación
  async reenviarCodigoVerificacion(email) {
    try {
      // Verificar que el email exista
      const emailExiste = await crearCuentaModel.verificarEmailExistente(email);
      if (!emailExiste) {
        throw new Error('El email no está registrado');
      }

      // Obtener nombres del usuario
      const { db } = await import('../config/db.js');
      const query = `
        SELECT c.nombres
        FROM casilleros_clientes c
        INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
        WHERE u.email = ?
      `;
      const [rows] = await db.execute(query, [email]);
      
      if (rows.length === 0) {
        throw new Error('No se encontraron datos del usuario');
      }

      const nombres = rows[0].nombres;

      // Generar nuevo código
      const codigoVerificacion = validaciones.generarCodigoVerificacion();

      // Guardar código en BD
      await crearCuentaModel.guardarCodigoVerificacion(email, codigoVerificacion);

      // Enviar código por email
      await emailService.enviarCodigoVerificacion(email, codigoVerificacion, nombres);

      return {
        success: true,
        message: 'Código de verificación reenviado correctamente'
      };
    } catch (error) {
      throw error;
    }
  },

  // Cambiar email si aún no está verificado
  async cambiarEmailNoVerificado(emailActual, emailNuevo) {
    try {
      // Validar formato del nuevo email
      if (!validaciones.esEmailValido(emailNuevo)) {
        const sugerencia = validaciones.sugerirCorreccionEmail(emailNuevo);
        if (sugerencia) {
          throw new Error(`El formato del email parece incorrecto. ¿Quisiste decir ${sugerencia}?`);
        }
        throw new Error('El formato del email no es válido. Verifica que esté escrito correctamente.');
      }

      // Verificar que el email actual exista y NO esté verificado
      const { db } = await import('../config/db.js');
      const queryVerificar = `
        SELECT email_verificado 
        FROM usuarios 
        WHERE email = ?
      `;
      const [rows] = await db.execute(queryVerificar, [emailActual]);
      
      if (rows.length === 0) {
        throw new Error('El email actual no está registrado');
      }

      if (rows[0].email_verificado) {
        throw new Error('No puedes cambiar un email que ya ha sido verificado');
      }

      // Verificar que el nuevo email no esté en uso
      const nuevoEmailExiste = await crearCuentaModel.verificarEmailExistente(emailNuevo);
      if (nuevoEmailExiste) {
        throw new Error('El nuevo email ya está registrado por otro usuario');
      }

      // Invalidar códigos antiguos del email anterior
      await crearCuentaModel.invalidarCodigosAntiguos(emailActual);

      // Actualizar email
      const actualizado = await crearCuentaModel.actualizarEmailNoVerificado(emailActual, emailNuevo);
      
      if (!actualizado) {
        throw new Error('No se pudo actualizar el email');
      }

      // Obtener nombres del usuario para el nuevo código
      const queryNombres = `
        SELECT c.nombres
        FROM casilleros_clientes c
        INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
        WHERE u.email = ?
      `;
      const [rowsNombres] = await db.execute(queryNombres, [emailNuevo]);
      const nombres = rowsNombres[0]?.nombres || 'Usuario';

      // Generar y enviar nuevo código al nuevo email
      const codigoVerificacion = validaciones.generarCodigoVerificacion();
      await crearCuentaModel.guardarCodigoVerificacion(emailNuevo, codigoVerificacion);
      await emailService.enviarCodigoVerificacion(emailNuevo, codigoVerificacion, nombres);

      return {
        success: true,
        message: 'Email actualizado correctamente. Se ha enviado un nuevo código de verificación.',
        nuevoEmail: emailNuevo
      };
    } catch (error) {
      throw error;
    }
  }
};
