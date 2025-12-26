import bcrypt from 'bcryptjs';
import { db } from './src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@sistema.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123456';

async function crearAdministrador() {
  try {
    // Crear o verificar roles
    await db.execute(`
      INSERT IGNORE INTO roles (id_rol, nombre) 
      VALUES 
        (1, 'administrador'),
        (2, 'cliente')
    `);
    console.log('✅ Roles verificados');

    // Verificar si ya existe un administrador
    const [admins] = await db.execute(
      'SELECT id_usuario, email FROM usuarios WHERE id_rol = 1 LIMIT 1'
    );

    if (admins.length > 0) {
      console.log('⚠️  Administrador ya existe:', admins[0].email);
      process.exit(0);
    }

    // Verificar si el email ya existe
    const [usuarios] = await db.execute(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [ADMIN_EMAIL]
    );

    if (usuarios.length > 0) {
      console.log('❌ Email ya registrado:', ADMIN_EMAIL);
      process.exit(1);
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Insertar el administrador
    await db.execute(
      'INSERT INTO usuarios (email, password, id_rol, estado) VALUES (?, ?, 1, "activo")',
      [ADMIN_EMAIL, passwordHash]
    );

    console.log('✅ Administrador creado:', ADMIN_EMAIL);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

crearAdministrador();