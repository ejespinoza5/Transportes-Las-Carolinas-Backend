import { db } from "../config/db.js";

export const PaqueteModel = {
  // Obtener todos los paquetes activos
  getAll: async () => {
    const [rows] = await db.query(
      `SELECT p.id_Paquete, p.Servicio, p.Guia, p.Fecha_Salida, p.Remitente, p.Peso_LB, p.Courier,
      p.id_estado, e.nombre_estado, p.guia_tramaco, p.Fecha_registro, p.Hora_registro, p.estado 
      FROM paquete as p
      LEFT JOIN estados e 
      ON p.id_estado=e.id_estado
      WHERE p.estado='activo'
      ORDER BY p.id_Paquete DESC;`
    );
    return rows;
  },

  // Obtener paquetes con paginación
  getAllPaginated: async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    
    // Obtener total de registros
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM paquete WHERE estado='activo'`
    );
    const total = countResult[0].total;

    // Obtener registros paginados
    const [rows] = await db.query(
      `SELECT p.id_Paquete, p.Servicio, p.Guia, p.Fecha_Salida, p.Remitente, p.Peso_LB, p.Courier,
      p.id_estado, e.nombre_estado, p.guia_tramaco, p.Fecha_registro, p.Hora_registro, p.estado 
      FROM paquete as p
      LEFT JOIN estados e 
      ON p.id_estado=e.id_estado
      WHERE p.estado='activo'
      ORDER BY p.id_Paquete DESC
      LIMIT ? OFFSET ?;`,
      [limit, offset]
    );

    return {
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // Obtener un paquete por ID
  getById: async (id) => {
    const [rows] = await db.query(
      `SELECT p.id_Paquete, p.Servicio,p.Guia,p.Fecha_Salida,p.Remitente,p.Peso_LB,p.Courier, p.id_estado,
      e.nombre_estado, p.guia_tramaco,p.Fecha_registro,p.Hora_registro,p.estado FROM paquete as p
      LEFT JOIN estados e 
      ON p.id_estado=e.id_estado
      WHERE p.id_Paquete = ? AND p.estado='activo';`,
      [id]
    );
    return rows[0];
  },
  // Obtener un paquete por GUIA
  getByGuia: async (guia) => {
    const [rows] = await db.query(
      `SELECT p.id_Paquete, p.Servicio, p.Guia, p.Fecha_Salida, p.Remitente,
       p.Peso_LB, p.Courier, p.id_estado, e.nombre_estado,
       p.guia_tramaco, p.Fecha_registro, p.Hora_registro, p.estado
FROM paquete p
LEFT JOIN estados e ON p.id_estado = e.id_estado
WHERE p.Guia = ?`,
      [guia]
    );
    return rows[0];
  },

  // Obtener paquete por número de guía (solo activos)
  getByGuiaActivo: async (guia) => {
    const [rows] = await db.query(
      "SELECT * FROM paquete WHERE Guia = ? AND estado = 'activo'",
      [guia]
    );
    return rows[0];
  },

  // Crear un paquete
  create: async (data) => {
    try {
      const sql = `
      INSERT INTO paquete 
      (Servicio, Guia, Fecha_Salida, Remitente, Peso_LB, Courier, id_estado, guia_tramaco,
       Fecha_registro, Hora_registro)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

      const params = [
        data.Servicio,
        data.Guia,
        data.Fecha_Salida,
        data.Remitente,
        data.Peso_LB,
        data.Courier,
        data.id_estado,
        data.guia_tramaco,
        data.Fecha_registro,
        data.Hora_registro,
      ];

      const [result] = await db.query(sql, params);
      return result.insertId;

    } catch (error) {
      throw error;
    }
  },

  // Actualizar un paquete (solo campos enviados)
  update: async (id, data) => {
    // Construir dinámicamente la consulta solo con los campos que vienen
    const campos = [];
    const valores = [];

    if (data.Servicio !== undefined) {
      campos.push('Servicio = ?');
      valores.push(data.Servicio);
    }
    if (data.Guia !== undefined) {
      campos.push('Guia = ?');
      valores.push(data.Guia);
    }
    if (data.Fecha_Salida !== undefined) {
      campos.push('Fecha_Salida = ?');
      valores.push(data.Fecha_Salida);
    }
    if (data.Remitente !== undefined) {
      campos.push('Remitente = ?');
      valores.push(data.Remitente);
    }
    if (data.Peso_LB !== undefined) {
      campos.push('Peso_LB = ?');
      valores.push(data.Peso_LB);
    }
    if (data.Courier !== undefined) {
      campos.push('Courier = ?');
      valores.push(data.Courier);
    }
    if (data.id_estado !== undefined) {
      campos.push('id_estado = ?');
      valores.push(data.id_estado);
    }
    if (data.guia_tramaco !== undefined) {
      campos.push('guia_tramaco = ?');
      valores.push(data.guia_tramaco);
    }

    // Si no hay campos para actualizar, retornar sin hacer nada
    if (campos.length === 0) {
      return { affectedRows: 0 };
    }

    // Agregar el ID al final
    valores.push(id);

    const sql = `UPDATE paquete SET ${campos.join(', ')} WHERE id_Paquete = ? AND estado='activo'`;

    const [result] = await db.query(sql, valores);
    return result;
  },

  // Desactivar (en lugar de eliminar)
  deactivate: async (id) => {
    const [result] = await db.query(
      "UPDATE paquete SET estado = 'inactivo' WHERE id_Paquete = ?",
      [id]
    );
    return result;
  },

   updateEstado: async (id, id_estado) => {
    const sql = `
      UPDATE paquete
      SET id_estado = ?
      WHERE id_Paquete = ? AND estado = 'activo'
    `;
    const [result] = await db.query(sql, [id_estado, id]);
    return result;
  },
  getByGuiaFull: async (guia) => {
    const sql = `
      SELECT 
          p.id_Paquete,
          p.Servicio,
          p.Guia,
          p.Fecha_Salida,
          p.Remitente,
          p.Peso_LB,
          p.Courier,
          p.guia_tramaco,

          e.nombre_estado AS estado,
          h.observaciones,
          h.fecha_cambio,
          h.hora_cambio

      FROM paquete p
      LEFT JOIN historial_estados h 
             ON p.id_Paquete = h.id_Paquete 
            AND h.estado = 'activo'
      LEFT JOIN estados e 
             ON h.id_estado = e.id_estado

      WHERE p.Guia = ?
        AND p.estado = 'activo'

      ORDER BY h.fecha_cambio ASC, h.hora_cambio ASC
    `;

    const [rows] = await db.query(sql, [guia]);
    return rows; // puede traer varias filas por historial
  },
};
