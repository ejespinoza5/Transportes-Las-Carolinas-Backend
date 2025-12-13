import { PaqueteModel } from "../models/paquete.model.js";
import { HistorialEstadosModel } from "../models/historial_estados.model.js";

export const PaqueteService = {
  getAll: () => {
    return PaqueteModel.getAll();
  },

  getAllPaginated: (page, limit) => {
    return PaqueteModel.getAllPaginated(page, limit);
  },

getById: (id) => {
    return PaqueteModel.getById(id);
  },

  getByGuia: (guia) => {
    return PaqueteModel.getByGuia(guia);
  },

  create: async (data) => {
    try {
      // Verificar si ya existe un paquete activo con esa guía
      const paqueteExistente = await PaqueteModel.getByGuiaActivo(data.Guia);
      
      if (paqueteExistente) {
        throw {
          status: 400,
          message: "Ya existe un paquete activo con ese número de guía."
        };
      }

      // Agregar fecha y hora de registro automáticamente
      const now = new Date();
      const fechaRegistro = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const horaRegistro = now.toTimeString().split(' ')[0]; // HH:MM:SS

      const paqueteData = {
        ...data,
        Fecha_registro: fechaRegistro,
        Hora_registro: horaRegistro
      };

      return await PaqueteModel.create(paqueteData);

    } catch (error) {
      // Si ya es un error personalizado, lanzarlo tal cual
      if (error.status) {
        throw error;
      }

      // 🟥 Error de guía duplicada (por si acaso hay UNIQUE en BD)
      if (error.code === "ER_DUP_ENTRY") {
        throw {
          status: 400,
          message: "La guía ingresada ya existe. Use otra."
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
      // Verificar si ya existe otro paquete activo con esa guía
      const paqueteExistente = await PaqueteModel.getByGuiaActivo(data.Guia);
      
      // Si existe y NO es el mismo que estamos actualizando
      if (paqueteExistente && paqueteExistente.id_Paquete != id) {
        throw {
          status: 400,
          message: "Ya existe un paquete activo con ese número de guía."
        };
      }

      return await PaqueteModel.update(id, data);

    } catch (error) {
      // Si ya es un error personalizado, lanzarlo tal cual
      if (error.status) {
        throw error;
      }

      // 🟥 Error de guía duplicada en base de datos
      if (error.code === "ER_DUP_ENTRY") {
        throw {
          status: 400,
          message: "El número de guía ya está registrado en el sistema (puede estar inactivo). Use otro número de guía."
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
  updateEstado: async (id, data) => {
  try {

    // 1. Validar paquete existente desde el modelo
    const paquete = await PaqueteModel.getById(id);
    if (!paquete) {
      throw { status: 404, message: "Paquete no encontrado" };
    }

    // 2. Verificar si el estado actual del paquete es el mismo que se quiere asignar
    if (paquete.id_estado == data.id_estado) {
      throw { 
        status: 400, 
        message: "El paquete ya tiene ese estado asignado. No se puede asignar el mismo estado dos veces consecutivas." 
      };
    }

    // 3. Actualizar el estado desde el modelo
    const result = await PaqueteModel.updateEstado(id, data.id_estado);

    if (result.affectedRows === 0) {
      throw { status: 400, message: "No se pudo actualizar el estado" };
    }

    // 4. Registrar historial
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
getByGuiaFull: async (guia) => {
  const rows = await PaqueteModel.getByGuiaFull(guia);

  if (!rows || rows.length === 0) {
    throw {
      status: 404,
      message: "No se encontró un paquete con esa guía."
    };
  }

  // --- Datos únicos del paquete (tomamos la primera fila) ---
  const paquete = {
    id_Paquete: rows[0].id_Paquete,
    Servicio: rows[0].Servicio,
    Guia: rows[0].Guia,
    Fecha_Salida: rows[0].Fecha_Salida,
    Remitente: rows[0].Remitente,
    Peso_LB: rows[0].Peso_LB,
    Courier: rows[0].Courier,
    guia_tramaco: rows[0].guia_tramaco
  };

  // --- Historial agrupado ---
  const historial = rows.map(r => ({
    estado: r.estado,
    observaciones: r.observaciones,
    fecha_cambio: r.fecha_cambio,
    hora_cambio: r.hora_cambio
  }));

  return { paquete, historial };
},

  deactivate: (id) => {
    return PaqueteModel.deactivate(id);
  },

  // Método para importación: actualiza si existe, crea si no existe
  upsert: async (data) => {
    try {
      // Agregar fecha y hora de registro automáticamente
      const now = new Date();
      const fechaRegistro = now.toISOString().split('T')[0];
      const horaRegistro = now.toTimeString().split(' ')[0];

      const paqueteData = {
        ...data,
        Fecha_registro: fechaRegistro,
        Hora_registro: horaRegistro
      };

      // Buscar si ya existe un paquete activo con esa guía
      const paqueteExistente = await PaqueteModel.getByGuiaActivo(data.Guia);
      
      if (paqueteExistente) {
        // Si existe, actualizar
        await PaqueteModel.update(paqueteExistente.id_Paquete, paqueteData);
        return { action: 'updated', id: paqueteExistente.id_Paquete };
      } else {
        // Si no existe, crear
        const id = await PaqueteModel.create(paqueteData);
        return { action: 'created', id };
      }

    } catch (error) {
      throw {
        status: 500,
        message: "Error en upsert",
        detalle: error.message
      };
    }
  },
};

