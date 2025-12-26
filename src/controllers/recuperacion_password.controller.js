import { recuperacionPasswordService } from '../services/recuperacion_password.service.js';

export const recuperacionPasswordController = {
  // POST /api/recuperacion/solicitar
  async solicitarRecuperacion(req, res) {
    try {
      const { email } = req.body;
      const ip_solicitud = req.ip || req.connection.remoteAddress;

      const resultado = await recuperacionPasswordService.solicitarRecuperacion(email, ip_solicitud);

      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error en solicitarRecuperacion:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al solicitar recuperación de contraseña'
      });
    }
  },

  // POST /api/recuperacion/verificar
  async verificarCodigo(req, res) {
    try {
      const { email, codigo } = req.body;

      const resultado = await recuperacionPasswordService.verificarCodigo(email, codigo);

      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error en verificarCodigo:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al verificar el código'
      });
    }
  },

  // POST /api/recuperacion/cambiar-password
  async cambiarPassword(req, res) {
    try {
      const { email, codigo, nuevaPassword } = req.body;

      const resultado = await recuperacionPasswordService.cambiarPassword(
        email,
        codigo,
        nuevaPassword
      );

      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error en cambiarPassword:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al cambiar la contraseña'
      });
    }
  }
};
