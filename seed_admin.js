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
    console.log('‚úÖ Roles verificados');

    // Contar administradores existentes
    const [admins] = await db.execute(
      'SELECT id_usuario FROM usuarios WHERE id_rol = 1'
    );

    if (admins.length >= 2) {
      console.log('‚ö†Ô∏è  Ya existen 2 administradores. No se crear√° otro.');
      process.exit(0);
    }

    // Verificar si el email ya existe
    const [usuarios] = await db.execute(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [ADMIN_EMAIL]
    );

    if (usuarios.length > 0) {
      console.log('‚ùå Email ya registrado:', ADMIN_EMAIL);
      process.exit(1);
    }

    // Hashear la contrase√±a
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Insertar nuevo administrador
    await db.execute(
      `INSERT INTO usuarios 
       (email, password, id_rol, estado, email_verificado) 
       VALUES (?, ?, 1, 'activo', 1)`,
      [ADMIN_EMAIL, passwordHash]
    );

    console.log('‚úÖ Administrador creado:', ADMIN_EMAIL);
    console.log(`Ì†ΩÌ±• Total administradores ahora: ${admins.length + 1}`);

    process.exit(0);
  } catch (error) {
    console.error('‚ùå Error:', error.message);
    process.exit(1);
  }
}

crearAdministrador();
