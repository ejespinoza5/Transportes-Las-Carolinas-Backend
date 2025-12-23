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
          error.message.includes('debe ser')) {
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
  }
};
