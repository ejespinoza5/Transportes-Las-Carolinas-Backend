import { db } from '../config/db.js';

export const casilleroClienteModel = {
  // Obtener casillero por id_usuario
  async obtenerPorUsuario(id_usuario) {
    const query = `
      SELECT * FROM casilleros_clientes
      WHERE id_usuario = ?
    `;
    const [rows] = await db.execute(query, [id_usuario]);
    return rows[0] || null;
  },

  // Obtener casillero por ID
  async obtenerPorId(id) {
    const query = `
      SELECT * FROM casilleros_clientes
      WHERE id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  },

  // Obtener casillero por código de casillero
  async obtenerPorCodigoCasillero(cod_casillero) {
    const query = `
      SELECT * FROM casilleros_clientes
      WHERE cod_casillero = ?
    `;
    const [rows] = await db.execute(query, [cod_casillero]);
    return rows[0] || null;
  },

  // Obtener todos los casilleros (solo admin)
  async obtenerTodos() {
    const query = `
      SELECT 
        c.*,
        u.email,
        u.estado as estado_usuario
      FROM casilleros_clientes c
      INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
      ORDER BY c.fecha_registro DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  },

  // Obtener todos los casilleros con paginación (solo admin)
  async obtenerTodosPaginados(page = 1, limit = 10, filtros = {}) {
    const offset = (page - 1) * limit;
    
    // Construir WHERE dinámico según filtros
    let whereClause = [];
    let params = [];
    
    if (filtros.search) {
      whereClause.push(`(
        c.nombres LIKE ? OR 
        c.apellidos LIKE ? OR 
        c.cedula LIKE ? OR 
        c.cod_casillero LIKE ? OR
        u.email LIKE ?
      )`);
      const searchTerm = `%${filtros.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (filtros.estado) {
      whereClause.push('c.estado = ?');
      params.push(filtros.estado);
    }
    
    if (filtros.tipo_entrega) {
      whereClause.push('c.tipo_entrega = ?');
      params.push(filtros.tipo_entrega);
    }
    
    const whereSQL = whereClause.length > 0 ? 'WHERE ' + whereClause.join(' AND ') : '';
    
    // Query para obtener el total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM casilleros_clientes c
      INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
      ${whereSQL}
    `;
    const [countResult] = await db.execute(countQuery, params);
    const total = countResult[0].total;
    
    // Query para obtener los datos paginados
    const dataQuery = `
      SELECT 
        c.*,
        u.email,
        u.estado as estado_usuario
      FROM casilleros_clientes c
      INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
      ${whereSQL}
      ORDER BY c.fecha_registro DESC
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);
    const [rows] = await db.execute(dataQuery, params);
    
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

  // Actualizar casillero (solo los campos enviados)
  async actualizar(id, datosActualizar) {
    // Construir dinámicamente la query solo con los campos enviados
    const camposPermitidos = [
      'nombres', 'apellidos', 'celular', 'ciudad', 'provincia',
      'cod_postal', 'tipo_entrega', 'direccion_casa',
      'calle_secundaria', 'referencia', 'estado'
    ];

    const campos = [];
    const valores = [];

    for (const [key, value] of Object.entries(datosActualizar)) {
      if (camposPermitidos.includes(key) && value !== undefined) {
        campos.push(`${key} = ?`);
        valores.push(value);
      }
    }

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    valores.push(id); // Agregar el ID al final para el WHERE

    const query = `
      UPDATE casilleros_clientes 
      SET ${campos.join(', ')}
      WHERE id = ?
    `;

    const [result] = await db.execute(query, valores);
    return result.affectedRows > 0;
  },

  // Verificar si cédula existe (excluyendo un ID específico)
  async verificarCedulaExistente(cedula, excluirId = null) {
    let query = 'SELECT id FROM casilleros_clientes WHERE cedula = ?';
    const params = [cedula];

    if (excluirId) {
      query += ' AND id != ?';
      params.push(excluirId);
    }

    const [rows] = await db.execute(query, params);
    return rows.length > 0;
  },

  // Actualizar estado del usuario asociado al casillero
  async actualizarEstadoUsuario(id_usuario, estado) {
    const query = 'UPDATE usuarios SET estado = ? WHERE id_usuario = ?';
    const [result] = await db.execute(query, [estado, id_usuario]);
    return result.affectedRows > 0;
  }
};
