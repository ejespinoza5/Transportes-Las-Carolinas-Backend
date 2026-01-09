import { db } from '../config/db.js';

export const crearCuentaModel = {
  // Crear usuario en la tabla usuarios
  async crearUsuario(email, passwordHash, id_rol = 2) {
    const query = `
      INSERT INTO usuarios (email, password, id_rol, estado)
      VALUES (?, ?, ?, 'activo')
    `;
    const [result] = await db.execute(query, [email, passwordHash, id_rol]);
    return result.insertId;
  },

  // Verificar si el email ya existe
  async verificarEmailExistente(email) {
    const query = 'SELECT id_usuario FROM usuarios WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows.length > 0;
  },

  // Verificar si la cédula ya existe
  async verificarCedulaExistente(cedula) {
    const query = 'SELECT id FROM casilleros_clientes WHERE cedula = ?';
    const [rows] = await db.execute(query, [cedula]);
    return rows.length > 0;
  },

  // Obtener el siguiente código de casillero disponible en formato EC-0001
  async obtenerSiguienteCodCasillero() {
    const query = 'SELECT cod_casillero FROM casilleros_clientes ORDER BY id DESC LIMIT 1';
    const [rows] = await db.execute(query);
    
    if (rows.length === 0) {
      // Si no hay casilleros, empieza en EC-0001
      return 'EC-0001';
    }
    
    const ultimoCodigo = rows[0].cod_casillero;
    let siguienteNumero = 1;
    
    // Intentar extraer el número del último código
    if (ultimoCodigo && typeof ultimoCodigo === 'string' && ultimoCodigo.includes('-')) {
      // Si tiene el formato EC-0001
      const partes = ultimoCodigo.split('-');
      const numeroExtraido = parseInt(partes[1]);
      if (!isNaN(numeroExtraido)) {
        siguienteNumero = numeroExtraido + 1;
      }
    } else if (ultimoCodigo && !isNaN(ultimoCodigo)) {
      // Si es un número antiguo (por compatibilidad)
      siguienteNumero = parseInt(ultimoCodigo) + 1;
    }
    
    // Formatear con ceros a la izquierda (mínimo 4 dígitos)
    const numeroFormateado = siguienteNumero.toString().padStart(4, '0');
    
    return `EC-${numeroFormateado}`;
  },

  // Crear casillero del cliente
  async crearCasillero(datosCasillero) {
    const {
      id_usuario,
      nombres,
      apellidos,
      cedula,
      celular,
      ciudad,
      provincia,
      cod_postal,
      cod_casillero,
      tipo_entrega,
      direccion_casa,
      calle_secundaria,
      referencia
    } = datosCasillero;

    const query = `
      INSERT INTO casilleros_clientes (
        id_usuario, nombres, apellidos, cedula, celular, ciudad, provincia,
        cod_postal, cod_casillero, estado, tipo_entrega, direccion_casa,
        calle_secundaria, referencia
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo', ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      id_usuario,
      nombres,
      apellidos,
      cedula,
      celular,
      ciudad,
      provincia,
      cod_postal,
      cod_casillero,
      tipo_entrega,
      direccion_casa || null,
      calle_secundaria || null,
      referencia || null
    ]);

    return result.insertId;
  },

  // Guardar código de verificación
  async guardarCodigoVerificacion(email, codigo) {
    // Código expira en 15 minutos
    const expiraEn = new Date();
    expiraEn.setMinutes(expiraEn.getMinutes() + 15);

    const query = `
      INSERT INTO codigos_verificacion (email, codigo, expira_en)
      VALUES (?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [email, codigo, expiraEn]);
    return result.insertId;
  },

  // Verificar código de verificación
  async verificarCodigo(email, codigo) {
    const query = `
      SELECT * FROM codigos_verificacion
      WHERE email = ? AND codigo = ? AND usado = FALSE AND expira_en > NOW()
      ORDER BY id DESC
      LIMIT 1
    `;
    
    const [rows] = await db.execute(query, [email, codigo]);
    return rows.length > 0 ? rows[0] : null;
  },

  // Marcar código como usado
  async marcarCodigoUsado(id) {
    const query = 'UPDATE codigos_verificacion SET usado = TRUE WHERE id = ?';
    await db.execute(query, [id]);
  },

  // Marcar email como verificado
  async marcarEmailVerificado(email) {
    const query = 'UPDATE usuarios SET email_verificado = TRUE WHERE email = ?';
    await db.execute(query, [email]);
  },

  // Limpiar códigos expirados
  async limpiarCodigosExpirados() {
    const query = 'DELETE FROM codigos_verificacion WHERE expira_en < NOW() OR usado = TRUE';
    await db.execute(query);
  },

  // Actualizar email de usuario no verificado
  async actualizarEmailNoVerificado(emailActual, emailNuevo) {
    const query = `
      UPDATE usuarios 
      SET email = ? 
      WHERE email = ? AND email_verificado = FALSE
    `;
    const [result] = await db.execute(query, [emailNuevo, emailActual]);
    return result.affectedRows > 0;
  },

  // Invalidar códigos antiguos del email
  async invalidarCodigosAntiguos(email) {
    const query = 'UPDATE codigos_verificacion SET usado = TRUE WHERE email = ?';
    await db.execute(query, [email]);
  }
};
