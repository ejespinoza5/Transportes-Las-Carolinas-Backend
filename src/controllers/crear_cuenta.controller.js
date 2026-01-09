import { crearCuentaService } from '../services/crear_cuenta.service.js';

export const crearCuentaController = {
  async crearCuenta(req, res) {
    try {
      const datosCompletos = req.body;

      const resultado = await crearCuentaService.crearCuentaYCasillero(datosCompletos);

      return res.status(201).json(resultado);
    } catch (error) {
      console.error('Error al crear cuenta:', error);

      // Errores de validación o negocio
      if (error.message.includes('ya está registrado') || 
          error.message.includes('obligatorios') ||
          error.message.includes('debe ser') ||
          error.message.includes('formato del email') ||
          error.message.includes('Quisiste decir')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      // Errores de base de datos
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un registro con estos datos'
        });
      }

      // Error genérico
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor al crear la cuenta',
        error: error.message
      });
    }
  },

  async verificarEmail(req, res) {
    try {
      const { email, codigo } = req.body;

      if (!email || !codigo) {
        return res.status(400).json({
          success: false,
          message: 'Email y código son obligatorios'
        });
      }

      const resultado = await crearCuentaService.verificarEmail(email, codigo);

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al verificar email:', error);

      if (error.message.includes('inválido') || error.message.includes('expirado')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor al verificar email',
        error: error.message
      });
    }
  },

  async reenviarCodigo(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email es obligatorio'
        });
      }

      const resultado = await crearCuentaService.reenviarCodigoVerificacion(email);

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al reenviar código:', error);

      if (error.message.includes('no está registrado')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor al reenviar código',
        error: error.message
      });
    }
  },

  async cambiarEmail(req, res) {
    try {
      const { emailActual, emailNuevo } = req.body;

      if (!emailActual || !emailNuevo) {
        return res.status(400).json({
          success: false,
          message: 'Email actual y nuevo email son obligatorios'
        });
      }

      const resultado = await crearCuentaService.cambiarEmailNoVerificado(emailActual, emailNuevo);

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al cambiar email:', error);

      if (error.message.includes('no está registrado') || 
          error.message.includes('ya ha sido verificado') ||
          error.message.includes('ya está registrado') ||
          error.message.includes('formato del email') ||
          error.message.includes('Quisiste decir')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor al cambiar email',
        error: error.message
      });
    }
  }
};
