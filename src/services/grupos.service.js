import { GrupoModel } from "../models/grupos.model.js";
import { db } from "../config/db.js";

export const GrupoService = {
    getAll: () => {
        return GrupoModel.getAll();
    },
    getById: (id) => {
        return GrupoModel.getById(id);
    },
    create: async (data) => {
        try {
            // Verificar si ya existe un grupo ACTIVO con ese nombre
            const grupoExistente = await GrupoModel.getByNombreActivo(data.nombre);
            
            if (grupoExistente) {
                throw {
                    status: 400,
                    message: "Ya existe un grupo activo con ese nombre."
                };
            }

            return await GrupoModel.create(data);
        } catch (error) {
            // Si ya es un error personalizado, lanzarlo tal cual
            if (error.status) {
                throw error;
            }

            // 🟥 Error de estado duplicado (por si acaso hay UNIQUE en BD)
            if (error.code === "ER_DUP_ENTRY") {
                throw {
                    status: 400,
                    message: "El grupo ingresado ya existe. Use otro."
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
            // Si se está actualizando el nombre, verificar que no exista en otro grupo activo
            if (data.nombre !== undefined) {
                const grupoExistente = await GrupoModel.getByNombreActivo(data.nombre);
                
                // Si existe y NO es el mismo que estamos actualizando
                if (grupoExistente && grupoExistente.id_grupo != id) {
                    throw {
                        status: 400,
                        message: "Ya existe un grupo activo con ese nombre."
                    };
                }
            }

            return await GrupoModel.update(id, data);
        }
        catch (error) {
            // Si ya es un error personalizado, lanzarlo tal cual
            if (error.status) {
                throw error;
            }

            // 🟥 Error de estado duplicado (por si acaso hay UNIQUE en BD)
            if (error.code === "ER_DUP_ENTRY") {
                throw {
                    status: 400,
                    message: "El grupo ingresado ya existe. Use otro."
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
    desactivate: async (id) => {
        try {
            // Primero desactivar el grupo
            await GrupoModel.desactivate(id);
            
            // Luego desactivar todos los paquetes que pertenecen a este grupo
            const sql = "UPDATE paquete SET estado = 'inactivo' WHERE id_grupo = ? AND estado = 'activo'";
            const [result] = await db.query(sql, [id]);
            
            return {
                ok: true,
                message: `Grupo desactivado correctamente. Se desactivaron ${result.affectedRows} paquetes asociados.`,
                paquetesDesactivados: result.affectedRows
            };
        } catch (error) {
            throw {
                status: 500,
                message: "Error al desactivar el grupo",
                detalle: error.message
            };
        }
    }
};