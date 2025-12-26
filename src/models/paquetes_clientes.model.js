import { db } from "../config/db.js";

export const PaquetesClientesModel = {
  // Obtener todos los paquetes asignados a clientes (admin)
  getAll: async () => {
    const [rows] = await db.query(
      `SELECT pc.id_asignacion, pc.id_Paquete, pc.id_cliente, pc.peso_lb, 
              pc.foto_paquete, pc.observaciones, pc.fecha_asignacion, 
              pc.hora_asignacion,
              p.Guia, p.Servicio, p.Courier, p.id_estado,p.guia_tramaco,
              e.nombre_estado,
              cc.nombres as nombre_cliente, cc.apellidos as apellido_cliente, 
              cc.cod_casillero
       FROM paquetes_clientes pc
       INNER JOIN paquete p ON pc.id_Paquete = p.id_Paquete
       INNER JOIN casilleros_clientes cc ON pc.id_cliente = cc.id
       LEFT JOIN estados e ON p.id_estado = e.id_estado
       WHERE pc.estado = 'activo'
       ORDER BY pc.fecha_asignacion DESC, pc.hora_asignacion DESC`
    );
    return rows;
  },

  // Obtener paquetes de un cliente específico (para el cliente)
  getByCliente: async (id_cliente) => {
    const [rows] = await db.query(
      `SELECT pc.id_asignacion, pc.id_Paquete, pc.id_cliente, pc.peso_lb, 
              pc.foto_paquete, pc.observaciones, pc.fecha_asignacion, 
              pc.hora_asignacion,
              p.Guia, p.Servicio, p.Courier,p.guia_tramaco,p.Remitente, p.Fecha_Salida, p.id_estado,
              e.nombre_estado,
              cc.cod_casillero
       FROM paquetes_clientes pc
       INNER JOIN paquete p ON pc.id_Paquete = p.id_Paquete
       INNER JOIN casilleros_clientes cc ON pc.id_cliente = cc.id
       LEFT JOIN estados e ON p.id_estado = e.id_estado
       WHERE pc.id_cliente = ? AND pc.estado = 'activo'
       ORDER BY pc.fecha_asignacion DESC, pc.hora_asignacion DESC`,
      [id_cliente]
    );
    return rows;
  },

  // Obtener una asignación específica por ID
  getById: async (id_asignacion) => {
    const [rows] = await db.query(
      `SELECT pc.id_asignacion, pc.id_Paquete, pc.id_cliente, pc.peso_lb, 
              pc.foto_paquete, pc.observaciones, pc.fecha_asignacion, 
              pc.hora_asignacion,
              p.Guia, p.Servicio, p.Courier, p.Remitente, p.id_estado,
              e.nombre_estado,
              cc.nombres as nombre_cliente, cc.apellidos as apellido_cliente, 
              cc.cod_casillero
       FROM paquetes_clientes pc
       INNER JOIN paquete p ON pc.id_Paquete = p.id_Paquete
       INNER JOIN casilleros_clientes cc ON pc.id_cliente = cc.id
       LEFT JOIN estados e ON p.id_estado = e.id_estado
       WHERE pc.id_asignacion = ?`,
      [id_asignacion]
    );
    return rows[0];
  },

  // Crear nueva asignación de paquete a cliente
  create: async (data) => {
    const { id_Paquete, id_cliente, peso_lb, foto_paquete, observaciones } = data;
    const [result] = await db.query(
      `INSERT INTO paquetes_clientes 
       (id_Paquete, id_cliente, peso_lb, foto_paquete, observaciones) 
       VALUES (?, ?, ?, ?, ?)`,
      [id_Paquete, id_cliente, peso_lb || null, foto_paquete || null, observaciones || null]
    );
    return result.insertId;
  },

  // Actualizar asignación de paquete
  update: async (id_asignacion, data) => {
    const { id_Paquete, id_cliente, peso_lb, foto_paquete, observaciones } = data;
    
    // Construir query dinámicamente solo con los campos que se deben actualizar
    let query = `UPDATE paquetes_clientes SET id_Paquete = ?, id_cliente = ?, peso_lb = ?`;
    let params = [id_Paquete, id_cliente, peso_lb];
    
    // Solo actualizar foto si se proporciona una nueva
    if (foto_paquete !== null) {
      query += `, foto_paquete = ?`;
      params.push(foto_paquete);
    }
    
    query += `, observaciones = ? WHERE id_asignacion = ?`;
    params.push(observaciones, id_asignacion);
    
    const [result] = await db.query(query, params);
    return result.affectedRows;
  },

  // Eliminar (lógico) asignación de paquete
  delete: async (id_asignacion) => {
    const [result] = await db.query(
      `UPDATE paquetes_clientes SET estado = 'inactivo' WHERE id_asignacion = ?`,
      [id_asignacion]
    );
    return result.affectedRows;
  },

  // Verificar si existe una asignación
  exists: async (id_asignacion) => {
    const [rows] = await db.query(
      `SELECT id_asignacion FROM paquetes_clientes WHERE id_asignacion = ?`,
      [id_asignacion]
    );
    return rows.length > 0;
  },

  // Verificar si un paquete ya está asignado a un cliente
  isPaqueteAsignado: async (id_Paquete, excluir_id_asignacion = null) => {
    let query = `SELECT id_asignacion FROM paquetes_clientes 
       WHERE id_Paquete = ? AND estado = 'activo'`;
    let params = [id_Paquete];
    
    // Si se proporciona un id_asignacion a excluir, agregarlo a la consulta
    if (excluir_id_asignacion) {
      query += ` AND id_asignacion != ?`;
      params.push(excluir_id_asignacion);
    }
    
    const [rows] = await db.query(query, params);
    return rows.length > 0;
  },

  // Obtener la foto anterior para eliminarla al actualizar
  getFoto: async (id_asignacion) => {
    const [rows] = await db.query(
      `SELECT foto_paquete FROM paquetes_clientes WHERE id_asignacion = ?`,
      [id_asignacion]
    );
    return rows[0]?.foto_paquete;
  },

  // Verificar si existe un paquete
  existePaquete: async (id_Paquete) => {
    const [rows] = await db.query(
      `SELECT id_Paquete FROM paquete WHERE id_Paquete = ? AND estado = 'activo'`,
      [id_Paquete]
    );
    return rows.length > 0;
  },

  // Verificar si existe un cliente
  existeCliente: async (id_cliente) => {
    const [rows] = await db.query(
      `SELECT id FROM casilleros_clientes WHERE id = ?`,
      [id_cliente]
    );
    return rows.length > 0;
  }
};
