import { HistorialEstadosModel } from "../models/historial_estados.model.js";
import { PaqueteModel } from "../models/paquete.model.js";

export const HistorialEstadosService = {

  getAll: () => {
    return HistorialEstadosModel.getAll();
  },

  getById: (id) => {
    return HistorialEstadosModel.getById(id);
  },

  getByPaquete: (id_Paquete) => {
    return HistorialEstadosModel.getByPaquete(id_Paquete);
  },

  updateEstado: async (id, data) => {
    try {
      // 1. Verificar si existe el paquete
      const paquete = await PaqueteModel.getById(id);
      if (!paquete) {
        throw { status: 404, message: "Paquete no encontrado" };
      }

      // 2. Actualizar solo el estado en la tabla paquete
      const result = await PaqueteModel.updateEstado(id, data.id_estado);

      if (result.affectedRows === 0) {
        throw { status: 400, message: "No se pudo actualizar el estado" };
      }

      // 3. Registrar historial
      await HistorialEstadosModel.create({
        id_Paquete: id,
        id_estado: data.id_estado,
        observaciones: data.observaciones || null,
        fecha_cambio: data.fecha_cambio,
        hora_cambio: data.hora_cambio,
        usuario: data.usuario || null
      });

      return { ok: true, message: "Estado actualizado y registrado en historial" };

    } catch (error) {
      throw error.status ? error : {
        status: 500,
        message: "Error interno",
        detalle: error.message
      };
    }
  },

  update: async (id, data) => {
    try {
      const result = await HistorialEstadosModel.update(id, data);
      if (result.affectedRows === 0) {
        throw { status: 404, message: "Historial no encontrado o sin cambios" };
      }
      return { ok: true, message: "Historial actualizado correctamente" };
    } catch (error) {
      throw error.status ? error : {
        status: 500,
        message: "Error interno",
        detalle: error.message
      };
    }
  },

  deactivate: async (id) => {
    try {
      // 1. Obtener el historial que se va a desactivar
      const historialActual = await HistorialEstadosModel.getById(id);
      
      if (!historialActual) {
        throw { status: 404, message: "Historial no encontrado" };
      }

      const id_Paquete = historialActual.id_Paquete;

      // 2. Primero obtener TODOS los historiales del paquete (activos e inactivos)
      const todosLosHistoriales = await HistorialEstadosModel.getByPaqueteAll(id_Paquete);
  
      // Filtrar solo los activos
      const historialesActivos = todosLosHistoriales.filter(h => h.estado === 'activo');
      
      // 3. Filtrar para excluir el que vamos a desactivar y obtener el anterior
      const historialesRestantes = historialesActivos.filter(
        h => h.id_historial != id
      );

      // 4. Ahora sí, desactivar el historial actual
      await HistorialEstadosModel.deactivate(id);

      // 5. Actualizar el estado del paquete
      if (historialesRestantes.length > 0) {
        // Si hay un estado anterior, actualizar el paquete a ese estado
        const estadoAnterior = historialesRestantes[0]; // El más reciente de los que quedan
        
        await PaqueteModel.updateEstado(id_Paquete, estadoAnterior.id_estado);

        return { 
          ok: true, 
          message: "Historial desactivado y paquete revertido al estado anterior",
          estado_anterior: estadoAnterior.nombre_estado
        };
      } else {
        // Si no hay estados anteriores, poner id_estado en NULL
        await PaqueteModel.updateEstado(id_Paquete, null);
        
        return { 
          ok: true, 
          message: "Historial desactivado y estado del paquete puesto en blanco",
          estado_anterior: null
        };
      }

    } catch (error) {
      throw error.status ? error : {
        status: 500,
        message: "Error al desactivar historial",
        detalle: error.message
      };
    }
  }
};