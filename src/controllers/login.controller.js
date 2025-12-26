import { loginService } from '../services/login.service.js';

export const loginController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const resultado = await loginService.iniciarSesion(email, password);

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Error en login:', error);

      // Errores de autenticación
      if (error.message.includes('Credenciales incorrectas') || 
          error.message.includes('obligatorios')) {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }

      // Usuario inactivo
      if (error.message.includes('inactivo')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      // Error genérico
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor al iniciar sesión',
        error: error.message
      });
    }
  }
};

export const cambiarPasswordController = {
  async cambiarPassword(req, res) {
    try {
      const { passwordActual, nuevaPassword } = req.body;
      const { id_usuario } = req.usuario; // Del middleware verificarToken

      const resultado = await loginService.cambiarPassword(
        id_usuario,
        passwordActual,
        nuevaPassword
      );

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);

      if (error.message.includes('obligatorias') ||
          error.message.includes('incorrecta') ||
          error.message.includes('diferente') ||
          error.message.includes('al menos 8') ||
          error.message.includes('mayúscula') ||
          error.message.includes('minúscula') ||
          error.message.includes('número') ||
          error.message.includes('carácter especial')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error al cambiar la contraseña',
        error: error.message
      });
    }
  }
};

export const actualizarEmailController = {
  async actualizarEmail(req, res) {
    try {
      const { nuevoEmail } = req.body;
      const { id_usuario } = req.usuario; // Del middleware verificarToken

      const resultado = await loginService.actualizarEmail(id_usuario, nuevoEmail);

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al actualizar email:', error);

      if (error.message.includes('obligatorio') ||
          error.message.includes('formato') ||
          error.message.includes('diferente') ||
          error.message.includes('ya está registrado')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error al actualizar el email',
        error: error.message
      });
    }
  }
};
