import { casilleroClienteService } from '../services/casillero_clientes.service.js';

export const casilleroClienteController = {
  // Obtener mi casillero (cliente autenticado)
  async obtenerMiCasillero(req, res) {
    try {
      const { id_usuario } = req.usuario; // Del middleware verificarToken

      const resultado = await casilleroClienteService.obtenerMiCasillero(id_usuario);

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al obtener casillero:', error);

      if (error.message.includes('No se encontró')) {
        return res.status(404).json({
          success: false,
          mensaje: error.message
        });
      }

      return res.status(500).json({
        success: false,
        mensaje: 'Error al obtener el casillero',
        error: error.message
      });
    }
  },

  // Obtener todos los casilleros (solo admin)
  async obtenerTodos(req, res) {
    try {
      const resultado = await casilleroClienteService.obtenerTodosCasilleros();

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al obtener casilleros:', error);

      return res.status(500).json({
        success: false,
        mensaje: 'Error al obtener los casilleros',
        error: error.message
      });
    }
  },

  // Obtener todos los casilleros con paginación (solo admin)
  async obtenerTodosPaginados(req, res) {
    try {
      const { page = 1, limit = 10, search, estado, tipo_entrega } = req.query;
      
      const filtros = {};
      if (search) filtros.search = search;
      if (estado) filtros.estado = estado;
      if (tipo_entrega) filtros.tipo_entrega = tipo_entrega;

      const resultado = await casilleroClienteService.obtenerTodosCasillerosPaginados(
        page,
        limit,
        filtros
      );

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al obtener casilleros paginados:', error);

      return res.status(500).json({
        success: false,
        mensaje: 'Error al obtener los casilleros',
        error: error.message
      });
    }
  },

  // Obtener casillero por código (admin)
  async obtenerPorCodigo(req, res) {
    try {
      const { cod_casillero } = req.params;

      const resultado = await casilleroClienteService.obtenerPorCodigo(parseInt(cod_casillero));

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al obtener casillero:', error);

      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          mensaje: error.message
        });
      }

      return res.status(500).json({
        success: false,
        mensaje: 'Error al obtener el casillero',
        error: error.message
      });
    }
  },

  // Actualizar casillero
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const datosActualizar = req.body;
      const { id_usuario, id_rol } = req.usuario; // Del middleware

      const resultado = await casilleroClienteService.actualizarCasillero(
        parseInt(id),
        datosActualizar,
        id_usuario,
        id_rol
      );

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al actualizar casillero:', error);

      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          mensaje: error.message
        });
      }

      if (error.message.includes('permisos') || error.message.includes('cédula ya está')) {
        return res.status(403).json({
          success: false,
          mensaje: error.message
        });
      }

      if (error.message.includes('campos')) {
        return res.status(400).json({
          success: false,
          mensaje: error.message
        });
      }

      return res.status(500).json({
        success: false,
        mensaje: 'Error al actualizar el casillero',
        error: error.message
      });
    }
  }
};
