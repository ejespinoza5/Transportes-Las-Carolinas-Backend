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

  // Obtener el siguiente número de casillero disponible
  async obtenerSiguienteCodCasillero() {
    const query = 'SELECT MAX(cod_casillero) as max_cod FROM casilleros_clientes';
    const [rows] = await db.execute(query);
    const maxCod = rows[0].max_cod;
    return maxCod ? maxCod + 1 : 1; // Si no hay casilleros, empieza en 1
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
  }
};
