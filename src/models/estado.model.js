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
    //actualizar estado (dinámico - solo campos enviados)
    update: async (id, data) => {
        try {
            const campos = [];
            const valores = [];

            if (data.nombre_estado !== undefined) {
                campos.push('nombre_estado = ?');
                valores.push(data.nombre_estado);
            }
            if (data.color !== undefined) {
                campos.push('color = ?');
                valores.push(data.color);
            }
            if (data.orden !== undefined) {
                campos.push('orden = ?');
                valores.push(data.orden);
            }

            if (campos.length === 0) {
                throw new Error('No hay campos para actualizar');
            }

            valores.push(id);

            const sql = `UPDATE estados SET ${campos.join(', ')} WHERE id_estado = ? AND estado='activo'`;
            const [result] = await db.query(sql, valores);
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