import { EstadoModel } from "../models/estado.model.js";
export const EstadoService = {
getAll: () => {
    return EstadoModel.getAll();
  },

  getById: (id) => {
    return EstadoModel.getById(id);
  },
    create: async (data) => {
      try {
        // Verificar si ya existe un estado ACTIVO con ese nombre
        const estadoExistente = await EstadoModel.getByNombreActivo(data.nombre_estado);
        
        if (estadoExistente) {
          throw {
            status: 400,
            message: "Ya existe un estado activo con ese nombre."
          };
        }

        return await EstadoModel.create(data);
      } catch (error) {
        // Si ya es un error personalizado, lanzarlo tal cual
        if (error.status) {
          throw error;
        }

        // 🟥 Error de estado duplicado (por si acaso hay UNIQUE en BD)
        if (error.code === "ER_DUP_ENTRY") {
          throw {
            status: 400,
            message: "El estado ingresado ya existe. Use otro."
          };
        }
        // 🟧 Otros errores de MySQL
        throw {
          status: 500,
          message: "Error interno del servidor.",
          detalle: error.message
        };
      }
    },
    update: async (id, data) => {
      try {
        // Verificar si ya existe otro estado activo con ese nombre
        const estadoExistente = await EstadoModel.getByNombreActivo(data.nombre_estado);
        
        // Si existe y NO es el mismo que estamos actualizando
        if (estadoExistente && estadoExistente.id_estado != id) {
          throw {
            status: 400,
            message: "Ya existe un estado activo con ese nombre."
          };
        }

        return await EstadoModel.update(id, data);

      } catch (error) {
        if (error.status) {
          throw error;
        }
        throw {
          status: 500,
          message: "Error interno del servidor.",
          detalle: error.message
        };
      }
    },

    deactivate: (id) => {
        return EstadoModel.deactivate(id);
    },
};  