import { HistorialEstadosService } from "../services/historial_estados.service.js";

export const HistorialEstadosController = {

  getAll: async (req, res) => {
    try {
      const historiales = await HistorialEstadosService.getAll();
      res.json(historiales);
    } catch (error) {
      res.status(500).json({
        ok: false,
        message: "Error al obtener historiales",
        detalle: error.message
      });
    }
  },

  getById: async (req, res) => {
    try {
      const historial = await HistorialEstadosService.getById(req.params.id);
      if (!historial) {
        return res.status(404).json({ message: "Historial no encontrado" });
      }
      res.json(historial);
    } catch (error) {
      res.status(500).json({
        ok: false,
        message: "Error al obtener historial",
        detalle: error.message
      });
    }
  },

  getByPaquete: async (req, res) => {
    try {
      const historiales = await HistorialEstadosService.getByPaquete(req.params.id_paquete);
      res.json(historiales);
    } catch (error) {
      res.status(500).json({
        ok: false,
        message: "Error al obtener historiales del paquete",
        detalle: error.message
      });
    }
  },

  update: async (req, res) => {
    try {
      const result = await HistorialEstadosService.update(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({
        ok: false,
        message: error.message || "Error desconocido",
        detalle: error.detalle || null
      });
    }
  },

  deactivate: async (req, res) => {
    try {
      await HistorialEstadosService.deactivate(req.params.id);
      res.json({ message: "Historial marcado como inactivo" });
    } catch (error) {
      res.status(500).json({
        ok: false,
        message: "Error al desactivar historial",
        detalle: error.message
      });
    }
  }
};