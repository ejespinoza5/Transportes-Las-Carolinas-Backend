import { PaqueteModel } from "../models/paquete.model.js";
import { HistorialEstadosModel } from "../models/historial_estados.model.js";
import { PaquetesClientesModel } from "../models/paquetes_clientes.model.js";
import { db } from "../config/db.js";

export const PaqueteService = {
  getAll: () => {
    return PaqueteModel.getAll();
  },

  getAllPaginated: (page, limit, id_grupo) => {
    return PaqueteModel.getAllPaginated(page, limit, id_grupo);
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

      const id_Paquete = await PaqueteModel.create(paqueteData);

      // Si tiene estado inicial, registrar todos los estados previos en el historial
      if (data.id_estado && data.id_estado > 0) {
        // Obtener todos los estados activos ordenados por su campo 'orden'
        const estadosActivos = await db.query(
          'SELECT id_estado, orden FROM estados WHERE estado = "activo" ORDER BY orden ASC'
        );
        const estados = estadosActivos[0];
        
        // Encontrar el orden del estado actual
        const estadoActual = estados.find(e => e.id_estado == data.id_estado);
        
        if (estadoActual) {
          // Registrar todos los estados hasta el orden del estado actual
          for (const estado of estados) {
            if (estado.orden <= estadoActual.orden) {
              await HistorialEstadosModel.create({
                id_Paquete: id_Paquete,
                id_estado: estado.id_estado,
                observaciones: estado.id_estado == data.id_estado ? 'Estado inicial' : 'Estado registrado automáticamente',
                fecha_cambio: fechaRegistro,
                hora_cambio: horaRegistro,
                usuario: data.usuario || null
              });
            }
          }
        }
      }

      return id_Paquete;

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

      // Actualizar el paquete
      const result = await PaqueteModel.update(id, data);

      // Si se actualizó el peso, sincronizar con paquetes_clientes
      if (data.Peso_LB !== undefined && data.Peso_LB !== null) {
        await PaquetesClientesModel.actualizarPesoPorPaquete(id, data.Peso_LB);
      }

      return result;

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

    // 5. Actualizar observaciones en paquetes_clientes (el nuevo estado es el más reciente)
    const observacionesSync = data.observaciones !== undefined ? data.observaciones : null;
    await PaquetesClientesModel.actualizarObservacionesPorPaquete(id, observacionesSync);

    return { ok: true, message: "Estado actualizado y registrado en historial" };

  } catch (error) {
    throw error.status ? error : {
      status: 500,
      message: "Error interno",
      detalle: error.message
    };
  }
},

  // Actualizar estado de múltiples paquetes
  updateEstadoMultiple: async (ids, data) => {
    try {
      // Validación básica
      if (!Array.isArray(ids) || ids.length === 0) {
        throw { status: 400, message: "Debe proporcionar un array de IDs" };
      }

      if (!data.id_estado || !data.fecha_cambio || !data.hora_cambio) {
        throw {
          status: 400,
          message: "id_estado, fecha_cambio y hora_cambio son obligatorios"
        };
      }

      const resultados = {
        actualizados: 0,
        omitidos: 0,
        errores: [],
        detalles: []
      };

      // Procesar cada paquete individualmente para validar estado duplicado
      for (const id of ids) {
        try {
          // Obtener paquete actual
          const paquete = await PaqueteModel.getById(id);
          
          if (!paquete) {
            resultados.errores.push(`Paquete ${id}: no encontrado`);
            continue;
          }

          // Verificar si ya tiene ese estado
          if (paquete.id_estado == data.id_estado) {
            resultados.omitidos++;
            resultados.detalles.push(`Paquete ${id} (${paquete.Guia}): ya tiene ese estado`);
            continue;
          }

          // Actualizar estado
          const result = await PaqueteModel.updateEstado(id, data.id_estado);

          if (result.affectedRows > 0) {
            // Registrar en historial
            await HistorialEstadosModel.create({
              id_Paquete: id,
              id_estado: data.id_estado,
              observaciones: data.observaciones || null,
              fecha_cambio: data.fecha_cambio,
              hora_cambio: data.hora_cambio,
              usuario: data.usuario || null
            });

            resultados.actualizados++;
            resultados.detalles.push(`Paquete ${id} (${paquete.Guia}): actualizado`);
          }

        } catch (error) {
          resultados.errores.push(`Paquete ${id}: ${error.message}`);
        }
      }

      return {
        ok: true,
        message: `Proceso completado: ${resultados.actualizados} actualizados, ${resultados.omitidos} omitidos`,
        ...resultados
      };

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
  const historial = rows
    .map(r => ({
      orden: r.orden,
      id_estado: r.id_estado,
      estado: r.estado,
      color: r.color,
      observaciones: r.observaciones,
      fecha_cambio: r.fecha_cambio,
      hora_cambio: r.hora_cambio
    }))
    .sort((a, b) => a.orden - b.orden); // Ordenar por campo orden ascendente

  return { paquete, historial };
},

  deactivate: (id) => {
    return PaqueteModel.deactivate(id);
  },

  // Desactivar múltiples paquetes
  deactivateMultiple: async (ids) => {
    try {
      // Validación básica
      if (!Array.isArray(ids) || ids.length === 0) {
        throw { status: 400, message: "Debe proporcionar un array de IDs" };
      }

      const resultados = {
        desactivados: 0,
        errores: [],
        detalles: []
      };

      // Procesar cada paquete individualmente
      for (const id of ids) {
        try {
          // Obtener paquete actual
          const paquete = await PaqueteModel.getById(id);
          
          if (!paquete) {
            resultados.errores.push(`Paquete ${id}: no encontrado`);
            continue;
          }

          // Verificar si ya está inactivo
          if (paquete.Activo === false || paquete.Activo === 0) {
            resultados.detalles.push(`Paquete ${id} (${paquete.Guia}): ya está inactivo`);
            continue;
          }

          // Desactivar
          const result = await PaqueteModel.deactivate(id);

          if (result.affectedRows > 0) {
            resultados.desactivados++;
            resultados.detalles.push(`Paquete ${id} (${paquete.Guia}): desactivado`);
          }

        } catch (error) {
          resultados.errores.push(`Paquete ${id}: ${error.message}`);
        }
      }

      return {
        ok: true,
        message: `Proceso completado: ${resultados.desactivados} paquetes desactivados`,
        ...resultados
      };

    } catch (error) {
      throw error.status ? error : {
        status: 500,
        message: "Error interno",
        detalle: error.message
      };
    }
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
        Hora_registro: horaRegistro,
        id_grupo: data.id_grupo || null, // Incluir id_grupo si viene en data
        id_estado: data.id_estado || null, // Incluir id_estado si viene en data
        estado: 'activo' // Reactivar si estaba inactivo
      };

      // Buscar si ya existe un paquete con esa guía (activo o inactivo)
      const paqueteExistente = await PaqueteModel.getByGuia(data.Guia);
      
      if (paqueteExistente) {
        // Si existe (activo o inactivo), actualizar y reactivar
        await PaqueteModel.update(paqueteExistente.id_Paquete, paqueteData);
        
        // Si tiene estado inicial, actualizar el historial también
        if (data.id_estado && data.id_estado > 0) {
          // Obtener todos los estados activos ordenados por su campo 'orden'
          const estadosActivos = await db.query(
            'SELECT id_estado, orden FROM estados WHERE estado = "activo" ORDER BY orden ASC'
          );
          const estados = estadosActivos[0];
          
          // Encontrar el orden del estado actual
          const estadoActual = estados.find(e => e.id_estado == data.id_estado);
          
          if (estadoActual) {
            // Obtener estados ya registrados para este paquete
            const historialExistente = await HistorialEstadosModel.getByPaqueteAll(paqueteExistente.id_Paquete);
            const estadosRegistrados = historialExistente.map(h => h.id_estado);
            
            // Registrar estados que faltan hasta el orden del estado actual
            for (const estado of estados) {
              if (estado.orden <= estadoActual.orden && !estadosRegistrados.includes(estado.id_estado)) {
                await HistorialEstadosModel.create({
                  id_Paquete: paqueteExistente.id_Paquete,
                  id_estado: estado.id_estado,
                  observaciones: estado.id_estado == data.id_estado ? 'Estado inicial al reimportar' : 'Estado registrado automáticamente',
                  fecha_cambio: fechaRegistro,
                  hora_cambio: horaRegistro,
                  usuario: data.usuario || null
                });
              }
            }
          }
        }
        
        return { action: 'updated', id: paqueteExistente.id_Paquete };
      } else {
        // Si no existe, crear
        const id = await PaqueteModel.create(paqueteData);
        
        // Si tiene estado inicial, registrar todos los estados previos en el historial
        if (data.id_estado && data.id_estado > 0) {
          // Obtener todos los estados activos ordenados por su campo 'orden'
          const estadosActivos = await db.query(
            'SELECT id_estado, orden FROM estados WHERE estado = "activo" ORDER BY orden ASC'
          );
          const estados = estadosActivos[0];
          
          // Encontrar el orden del estado actual
          const estadoActual = estados.find(e => e.id_estado == data.id_estado);
          
          if (estadoActual) {
            // Registrar todos los estados hasta el orden del estado actual
            for (const estado of estados) {
              if (estado.orden <= estadoActual.orden) {
                await HistorialEstadosModel.create({
                  id_Paquete: id,
                  id_estado: estado.id_estado,
                  observaciones: estado.id_estado == data.id_estado ? 'Estado inicial' : 'Estado registrado automáticamente',
                  fecha_cambio: fechaRegistro,
                  hora_cambio: horaRegistro,
                  usuario: data.usuario || null
                });
              }
            }
          }
        }
        
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

