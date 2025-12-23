import { db } from "../config/db.js";

export const GrupoModel = {
    // Obtener todos los grupos activos
    getAll: async () => {
        const [rows] = await db.query("SELECT * FROM grupos WHERE estado = 'activo'");
        return rows;
    },
    // Obtener grupo por id
    getById: async (id) => {
        const [rows] = await db.query(
            "SELECT * FROM grupos WHERE id_grupo = ? AND estado = 'activo'",
            [id]
        );
        return rows[0];
    },
    // Obtener grupo por nombre (solo activos)
    getByNombreActivo: async (nombre) => {
        const [rows] = await db.query(
            "SELECT * FROM grupos WHERE nombre = ? AND estado = 'activo'",
            [nombre]
        );
        return rows[0];
    },
    // Insertar nuevo grupo
    create: async (data) => {
        try {
            const sql = `
      INSERT INTO grupos 
      (nombre, fecha_inicial, fecha_final)
      VALUES (?,?,?)
    `;
            const params = [
                data.nombre,
                data.fecha_inicial,
                data.fecha_final
            ];
            const [result] = await db.query(sql, params);
            return result.insertId;
        } catch (error) {
            throw error;
        }
    },
    // Actualizar grupo (solo campos enviados)
    update: async (id, data) => {
        try {
            // Construir dinámicamente solo los campos que vienen
            const campos = [];
            const valores = [];

            if (data.nombre !== undefined) {
                campos.push('nombre = ?');
                valores.push(data.nombre);
            }
            if (data.fecha_inicial !== undefined) {
                campos.push('fecha_inicial = ?');
                valores.push(data.fecha_inicial);
            }
            if (data.fecha_final !== undefined) {
                campos.push('fecha_final = ?');
                valores.push(data.fecha_final);
            }

            if (campos.length === 0) {
                return { affectedRows: 0 };
            }

            valores.push(id);

            const sql = `UPDATE grupos SET ${campos.join(', ')} WHERE id_grupo = ? AND estado='activo'`;

            const [result] = await db.query(sql, valores);
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    },
    // Desactivar grupo
    desactivate: async (id) => {
        const sql = `
      UPDATE grupos SET 
      estado='inactivo'
        WHERE id_grupo = ?
    `;
        const params = [id];
        await db.query(sql, params);
    }
};