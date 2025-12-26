import { db } from '../config/db.js';

export const recuperacionPasswordModel = {
  // Verificar si el email existe en usuarios
  async verificarEmailExistente(email) {
    const query = 'SELECT id_usuario, email FROM usuarios WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows.length > 0 ? rows[0] : null;
  },

  // Invalidar tokens anteriores del usuario
  async invalidarTokensAnteriores(id_usuario) {
    const query = `
      UPDATE recuperacion_password 
      SET estado = 'expirado' 
      WHERE id_usuario = ? AND estado = 'activo'
    `;
    await db.execute(query, [id_usuario]);
  },

  // Crear registro de recuperación
  async crearSolicitudRecuperacion(id_usuario, email, token, ip_solicitud) {
    // Fecha de expiración: 15 minutos desde ahora
    const query = `
      INSERT INTO recuperacion_password (
        id_usuario, email, token, fecha_expiracion, ip_solicitud, estado
      ) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE), ?, 'activo')
    `;
    const [result] = await db.execute(query, [id_usuario, email, token, ip_solicitud]);
    return result.insertId;
  },

  // Buscar solicitud activa por email y token
  async buscarSolicitudPorToken(email, token) {
    const query = `
      SELECT 
        r.*,
        CASE 
          WHEN r.fecha_expiracion < NOW() THEN 'expirado'
          ELSE r.estado
        END as estado_real
      FROM recuperacion_password r
      WHERE r.email = ? AND r.token = ? AND r.estado = 'activo'
      ORDER BY r.fecha_creacion DESC
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [email, token]);
    return rows.length > 0 ? rows[0] : null;
  },

  // Incrementar intentos fallidos
  async incrementarIntentosFallidos(id_recuperacion) {
    const query = `
      UPDATE recuperacion_password 
      SET intentos_fallidos = intentos_fallidos + 1,
          estado = CASE 
            WHEN intentos_fallidos + 1 >= 3 THEN 'expirado'
            ELSE estado
          END
      WHERE id_recuperacion = ?
    `;
    await db.execute(query, [id_recuperacion]);
  },

  // Marcar token como usado
  async marcarTokenComoUsado(id_recuperacion) {
    const query = `
      UPDATE recuperacion_password 
      SET estado = 'usado', usado = 'si'
      WHERE id_recuperacion = ?
    `;
    await db.execute(query, [id_recuperacion]);
  },

  // Actualizar contraseña del usuario
  async actualizarPassword(id_usuario, passwordHash) {
    const query = 'UPDATE usuarios SET password = ? WHERE id_usuario = ?';
    await db.execute(query, [passwordHash, id_usuario]);
  },

  // Obtener nombre del usuario para el email
  async obtenerNombreUsuario(id_usuario) {
    const query = `
      SELECT CONCAT(nombres, ' ', apellidos) as nombre_completo 
      FROM casilleros_clientes 
      WHERE id_usuario = ? 
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [id_usuario]);
    return rows.length > 0 ? rows[0].nombre_completo : 'Usuario';
  }
};
