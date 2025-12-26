import bcrypt from 'bcryptjs';
import { crearCuentaModel } from '../models/crear_cuenta.model.js';
import { emailService } from '../utils/email.js';

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

      // 7. Enviar correo de bienvenida
      try {
        await emailService.enviarBienvenida(email, {
          nombres,
          apellidos,
          cod_casillero,
          tipo_entrega,
          ciudad
        });
      } catch (emailError) {
        // Si falla el email, no afecta la creación de la cuenta
        console.error('Error al enviar email de bienvenida:', emailError);
      }

      return {
        success: true,
        message: 'Cuenta y casillero creados exitosamente',
        data: {
          id_usuario,
          email,
          id_casillero,
          cod_casillero,
          nombres,
          apellidos
        }
      };
    } catch (error) {
      // Si hay error, el rollback se maneja en el controlador si es necesario
      throw error;
    }
  }
};
