import { db } from "../config/db.js";

export const HistorialEstadosModel = {

  // Obtener todos los historiales activos
  getAll: async () => {
    const [rows] = await db.query(
      `SELECT h.id_historial, h.id_Paquete, p.Guia, h.id_estado, e.nombre_estado,
      h.observaciones, h.fecha_cambio, h.hora_cambio, h.usuario, h.estado
      FROM historial_estados h
      LEFT JOIN paquete p ON h.id_Paquete = p.id_Paquete
      LEFT JOIN estados e ON h.id_estado = e.id_estado
      WHERE h.estado = 'activo'
      ORDER BY h.id_historial DESC`
    );
    return rows;
  },

  // Obtener historial por ID
  getById: async (id) => {
    const [rows] = await db.query(
      `SELECT h.id_historial, h.id_Paquete, p.Guia, h.id_estado, e.nombre_estado,
      h.observaciones, h.fecha_cambio, h.hora_cambio, h.usuario, h.estado
      FROM historial_estados h
      LEFT JOIN paquete p ON h.id_Paquete = p.id_Paquete
      LEFT JOIN estados e ON h.id_estado = e.id_estado
      WHERE h.id_historial = ? AND h.estado = 'activo'`,
      [id]
    );
    return rows[0];
  },

  // Obtener historial por paquete (incluyendo inactivos para el proceso de eliminación)
  getByPaqueteAll: async (id_Paquete) => {
    const [rows] = await db.query(
      `SELECT h.id_historial, h.id_Paquete, h.id_estado, e.nombre_estado,
      h.observaciones, h.fecha_cambio, h.hora_cambio, h.usuario, h.estado
      FROM historial_estados h
      LEFT JOIN estados e ON h.id_estado = e.id_estado
      WHERE h.id_Paquete = ?
      ORDER BY h.id_historial DESC`,
      [id_Paquete]
    );
    return rows;
  },

  // Obtener historial por paquete
  getByPaquete: async (id_Paquete) => {
    const [rows] = await db.query(
      `SELECT h.id_historial, h.id_Paquete, h.id_estado, e.nombre_estado,
      h.observaciones, h.fecha_cambio, h.hora_cambio, h.usuario, h.estado
      FROM historial_estados h
      LEFT JOIN estados e ON h.id_estado = e.id_estado
      WHERE h.id_Paquete = ? AND h.estado = 'activo'
      ORDER BY h.id_historial DESC`,
      [id_Paquete]
    );
    return rows;
  },

  create: async (data) => {
    const sql = `
      INSERT INTO historial_estados
      (id_Paquete, id_estado, observaciones, fecha_cambio, hora_cambio, usuario)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.id_Paquete,
      data.id_estado,
      data.observaciones || null,
      data.fecha_cambio,
      data.hora_cambio,
      data.usuario || null
    ];

    const [result] = await db.query(sql, params);
    return result.insertId;
  },

  update: async (id, data) => {
    // Construir dinámicamente solo los campos que vienen
    const campos = [];
    const valores = [];

    if (data.id_Paquete !== undefined) {
      campos.push('id_Paquete = ?');
      valores.push(data.id_Paquete);
    }
    if (data.id_estado !== undefined) {
      campos.push('id_estado = ?');
      valores.push(data.id_estado);
    }
    if (data.observaciones !== undefined) {
      campos.push('observaciones = ?');
      valores.push(data.observaciones);
    }
    if (data.fecha_cambio !== undefined) {
      campos.push('fecha_cambio = ?');
      valores.push(data.fecha_cambio);
    }
    if (data.hora_cambio !== undefined) {
      campos.push('hora_cambio = ?');
      valores.push(data.hora_cambio);
    }
    if (data.usuario !== undefined) {
      campos.push('usuario = ?');
      valores.push(data.usuario);
    }

    if (campos.length === 0) {
      return { affectedRows: 0 };
    }

    valores.push(id);

    const sql = `UPDATE historial_estados SET ${campos.join(', ')} WHERE id_historial = ? AND estado='activo'`;

    const [result] = await db.query(sql, valores);
    return result;
  },

  // Desactivar historial
  deactivate: async (id) => {
    const [result] = await db.query(
      "UPDATE historial_estados SET estado = 'inactivo' WHERE id_historial = ?",
      [id]
    );
    return result;
  }

};
