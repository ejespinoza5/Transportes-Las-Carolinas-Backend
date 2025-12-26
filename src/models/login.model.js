import { db } from '../config/db.js';

export const loginModel = {
  // Buscar usuario por email
  async buscarUsuarioPorEmail(email) {
    const query = `
      SELECT id_usuario, email, password, id_rol, estado
      FROM usuarios
      WHERE email = ?
    `;
    const [rows] = await db.execute(query, [email]);
    return rows[0] || null;
  },

  // Actualizar último acceso del usuario
  async actualizarUltimoAcceso(id_usuario) {
    const query = `
      UPDATE usuarios 
      SET ultimo_acceso = CURRENT_TIMESTAMP
      WHERE id_usuario = ?
    `;
    await db.execute(query, [id_usuario]);
  },

  // Verificar estado del casillero del usuario (solo para clientes - id_rol = 2)
  async verificarEstadoCasillero(id_usuario, id_rol) {
    // Solo verificar para clientes
    if (id_rol !== 2) {
      return true; // Admin no tiene casillero, siempre puede entrar
    }

    const query = `
      SELECT estado FROM casilleros_clientes
      WHERE id_usuario = ?
    `;
    const [rows] = await db.execute(query, [id_usuario]);
    
    if (rows.length === 0) {
      return false; // Cliente sin casillero
    }
    
    return rows[0].estado === 'activo';
  },

  // Obtener usuario por ID (para cambio de contraseña)
  async buscarUsuarioPorId(id_usuario) {
    const query = `
      SELECT id_usuario, email, password, id_rol, estado
      FROM usuarios
      WHERE id_usuario = ?
    `;
    const [rows] = await db.execute(query, [id_usuario]);
    return rows[0] || null;
  },

  // Actualizar contraseña del usuario
  async actualizarPassword(id_usuario, nuevoPasswordHash) {
    const query = `
      UPDATE usuarios
      SET password = ?
      WHERE id_usuario = ?
    `;
    const [result] = await db.execute(query, [nuevoPasswordHash, id_usuario]);
    return result.affectedRows > 0;
  },

  // Verificar si email ya existe (excluyendo un id_usuario específico)
  async verificarEmailExistente(email, excluirIdUsuario = null) {
    let query = 'SELECT id_usuario FROM usuarios WHERE email = ?';
    const params = [email];

    if (excluirIdUsuario) {
      query += ' AND id_usuario != ?';
      params.push(excluirIdUsuario);
    }

    const [rows] = await db.execute(query, params);
    return rows.length > 0;
  },

  // Actualizar email del usuario
  async actualizarEmail(id_usuario, nuevoEmail) {
    const query = 'UPDATE usuarios SET email = ? WHERE id_usuario = ?';
    const [result] = await db.execute(query, [nuevoEmail, id_usuario]);
    return result.affectedRows > 0;
  }
};
