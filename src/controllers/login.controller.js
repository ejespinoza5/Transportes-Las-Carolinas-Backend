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
