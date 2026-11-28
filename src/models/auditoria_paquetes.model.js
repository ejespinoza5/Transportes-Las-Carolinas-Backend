import { db } from "../config/db.js";

// Registro de quién elimina (desactiva) paquetes.
// Si el registro falla (por ejemplo, si la tabla aún no existe) NO se bloquea la
// eliminación: solo se escribe el error en el log del servidor.
export const AuditoriaPaquetesModel = {

  // Registra una fila por cada paquete indicado en `ids`
  registrarPorIds: async (ids, accion, usuario = {}) => {
    if (!Array.isArray(ids) || ids.length === 0) return 0;
    try {
      const [result] = await db.query(
        `INSERT INTO auditoria_paquetes
           (id_Paquete, Guia, id_grupo, accion, id_usuario, email_usuario, ip)
         SELECT p.id_Paquete, p.Guia, p.id_grupo, ?, u.id_usuario, u.email, ?
         FROM paquete p
         LEFT JOIN usuarios u ON u.id_usuario = ?
         WHERE p.id_Paquete IN (?)`,
        [accion, usuario.ip || null, usuario.id_usuario || null, ids]
      );
      return result.affectedRows;
    } catch (error) {
      console.error("[auditoria_paquetes] No se pudo registrar:", error.message);
      return 0;
    }
  },

  // Registra todos los paquetes ACTIVOS de un grupo (llamar ANTES de desactivarlos)
  registrarPorGrupo: async (id_grupo, accion, usuario = {}) => {
    try {
      const [result] = await db.query(
        `INSERT INTO auditoria_paquetes
           (id_Paquete, Guia, id_grupo, accion, id_usuario, email_usuario, ip)
         SELECT p.id_Paquete, p.Guia, p.id_grupo, ?, u.id_usuario, u.email, ?
         FROM paquete p
         LEFT JOIN usuarios u ON u.id_usuario = ?
         WHERE p.id_grupo = ? AND p.estado = 'activo'`,
        [accion, usuario.ip || null, usuario.id_usuario || null, id_grupo]
      );
      return result.affectedRows;
    } catch (error) {
      console.error("[auditoria_paquetes] No se pudo registrar:", error.message);
      return 0;
    }
  },

  // Consultar el registro (filtros opcionales)
  listar: async ({ guia, id_grupo, limit = 200 } = {}) => {
    const where = [];
    const params = [];
    if (guia) { where.push("a.Guia = ?"); params.push(guia); }
    if (id_grupo) { where.push("a.id_grupo = ?"); params.push(id_grupo); }
    params.push(Math.min(parseInt(limit) || 200, 1000));

    const [rows] = await db.query(
      `SELECT a.id_auditoria, a.id_Paquete, a.Guia, a.id_grupo, g.nombre AS nombre_grupo,
              a.accion, a.id_usuario, a.email_usuario, a.ip, a.fecha
       FROM auditoria_paquetes a
       LEFT JOIN grupos g ON g.id_grupo = a.id_grupo
       ${where.length ? "WHERE " + where.join(" AND ") : ""}
       ORDER BY a.id_auditoria DESC
       LIMIT ?`,
      params
    );
    return rows;
  },
};

// Obtiene { id_usuario, ip } del request para la auditoría
export const datosUsuarioRequest = (req) => ({
  id_usuario: req.usuario?.id_usuario || null,
  ip: (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.ip || null,
});
