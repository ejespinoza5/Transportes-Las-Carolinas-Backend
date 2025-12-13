import { db } from "../config/db.js";
export const EstadoModel = {
    //obtener todos los estados
    getAll: async () => {
        const [rows] = await db.query("SELECT * FROM estados WHERE estado = 'activo'");
        return rows;
    },

    //obtener estado por id
    getById: async (id) => {
        const [rows] = await db.query(
            "SELECT * FROM estados WHERE id_estado = ? AND estado = 'activo'",
            [id]
        );
        return rows[0];
    },
    //obtener estado por nombre (solo activos)
    getByNombreActivo: async (nombre) => {
        const [rows] = await db.query(
            "SELECT * FROM estados WHERE nombre_estado = ? AND estado = 'activo'",
            [nombre]
        );
        return rows[0];
    },
    //insertar nuevo estado
    create: async (data) => {
  try {
    const sql = `
      INSERT INTO estados 
      (nombre_estado,color, orden)
      VALUES (?,?,?)
    `;

    const params = [
      data.nombre_estado,
      data.color,
      data.orden
    ];

    const [result] = await db.query(sql, params);
    return result.insertId;

  } catch (error) {
    throw error;
  }
},
    //actualizar estado
    update: async (id, data) => {
        try {
            const sql = `
      UPDATE estados SET 
      nombre_estado=?,
      color=?,
      orden=?
      WHERE id_estado = ?
    `;

        const params = [
            data.nombre_estado,
            data.color,
            data.orden,
            id
        ];
        const [result] = await db.query(sql, params);
        return result.affectedRows;
    } catch (error) {
        throw error;
    }
    },

    //eliminar estado (opcional)
    deactivate: async (id) => {
    const [result] = await db.query(
      "UPDATE estados SET estado = 'inactivo' WHERE id_estado = ?",
      [id]
    );
    return result;
  },
};