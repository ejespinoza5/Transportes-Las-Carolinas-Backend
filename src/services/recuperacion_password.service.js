import bcrypt from 'bcryptjs';
import { recuperacionPasswordModel } from '../models/recuperacion_password.model.js';
import { emailService } from '../utils/email.js';

export const recuperacionPasswordService = {
  // Generar código de 6 dígitos aleatorio
  generarCodigoRecuperacion() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  // Solicitar código de recuperación
  async solicitarRecuperacion(email, ip_solicitud) {
    if (!email) {
      throw new Error('El email es obligatorio');
    }

    try {
      // 1. Verificar que el email exista
      const usuario = await recuperacionPasswordModel.verificarEmailExistente(email);
      if (!usuario) {
        throw new Error('No existe una cuenta con ese email');
      }

      // 2. Invalidar tokens anteriores activos
      await recuperacionPasswordModel.invalidarTokensAnteriores(usuario.id_usuario);

      // 3. Generar código de 6 dígitos
      const codigo = this.generarCodigoRecuperacion();

      // 4. Crear solicitud en la BD
      await recuperacionPasswordModel.crearSolicitudRecuperacion(
        usuario.id_usuario,
        email,
        codigo,
        ip_solicitud || null
      );

      // 5. Obtener nombre del usuario para personalizar el email
      const nombreUsuario = await recuperacionPasswordModel.obtenerNombreUsuario(usuario.id_usuario);

      // 6. Enviar código por email
      await emailService.enviarCodigoRecuperacion(email, codigo, nombreUsuario);

      return {
        success: true,
        message: 'Código de recuperación enviado a tu email'
      };
    } catch (error) {
      throw error;
    }
  },

  // Verificar código de recuperación
  async verificarCodigo(email, codigo) {
    if (!email || !codigo) {
      throw new Error('Email y código son obligatorios');
    }

    // Validar que el código sea de 6 dígitos
    if (!/^\d{6}$/.test(codigo)) {
      throw new Error('El código debe tener 6 dígitos');
    }

    try {
      // 1. Buscar solicitud activa
      const solicitud = await recuperacionPasswordModel.buscarSolicitudPorToken(email, codigo);

      if (!solicitud) {
        throw new Error('Código inválido o expirado');
      }

      // 2. Verificar si está expirado por tiempo
      if (solicitud.estado_real === 'expirado') {
        throw new Error('El código ha expirado. Solicita uno nuevo');
      }

      // 3. Verificar intentos fallidos
      if (solicitud.intentos_fallidos >= 3) {
        throw new Error('Demasiados intentos fallidos. Solicita un nuevo código');
      }

      // 4. Verificar si ya fue usado
      if (solicitud.usado === 'si' || solicitud.estado === 'usado') {
        throw new Error('Este código ya fue utilizado');
      }

      return {
        success: true,
        message: 'Código verificado correctamente',
        data: {
          id_recuperacion: solicitud.id_recuperacion,
          id_usuario: solicitud.id_usuario
        }
      };
    } catch (error) {
      throw error;
    }
  },

  // Validar formato de contraseña
  validarFormatoPassword(password) {
    const errores = [];

    // Longitud mínima de 8 caracteres
    if (password.length < 8) {
      errores.push('La contraseña debe tener al menos 8 caracteres');
    }

    // Al menos una letra mayúscula
    if (!/[A-Z]/.test(password)) {
      errores.push('La contraseña debe contener al menos una letra mayúscula');
    }

    // Al menos una letra minúscula
    if (!/[a-z]/.test(password)) {
      errores.push('La contraseña debe contener al menos una letra minúscula');
    }

    // Al menos un número
    if (!/[0-9]/.test(password)) {
      errores.push('La contraseña debe contener al menos un número');
    }

    // Al menos un carácter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errores.push('La contraseña debe contener al menos un carácter especial (!@#$%^&*()_+-=[]{};\':"|,.<>/?)');
    }

    return errores;
  },

  // Cambiar contraseña
  async cambiarPassword(email, codigo, nuevaPassword) {
    if (!email || !codigo || !nuevaPassword) {
      throw new Error('Email, código y nueva contraseña son obligatorios');
    }

    // Validar formato de la contraseña
    const erroresValidacion = this.validarFormatoPassword(nuevaPassword);
    if (erroresValidacion.length > 0) {
      throw new Error(erroresValidacion.join('. '));
    }

    try {
      // 1. Verificar código
      const verificacion = await this.verificarCodigo(email, codigo);

      if (!verificacion.success) {
        throw new Error('No se pudo verificar el código');
      }

      // 2. Hash de la nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(nuevaPassword, salt);

      // 3. Actualizar contraseña
      await recuperacionPasswordModel.actualizarPassword(
        verificacion.data.id_usuario,
        passwordHash
      );

      // 4. Marcar token como usado
      await recuperacionPasswordModel.marcarTokenComoUsado(verificacion.data.id_recuperacion);

      return {
        success: true,
        message: 'Contraseña actualizada exitosamente'
      };
    } catch (error) {
      throw error;
    }
  }
};
