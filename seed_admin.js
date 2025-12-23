import bcrypt from 'bcryptjs';
import { db } from './src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

// Credenciales del administrador (puedes cambiarlas aquí o usar variables de entorno)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@sistema.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123456';

async function crearAdministrador() {
  try {
    console.log('🔍 Verificando si ya existe un administrador...');

    // Verificar si ya existe un usuario con rol de administrador (id_rol = 1)
    const [admins] = await db.execute(
      'SELECT id_usuario, email FROM usuarios WHERE id_rol = 1 LIMIT 1'
    );

    if (admins.length > 0) {
      console.log('⚠️  Ya existe un administrador en el sistema:');
      console.log('   Email:', admins[0].email);
      console.log('   ID:', admins[0].id_usuario);
      console.log('\n✅ No es necesario crear otro administrador.');
      process.exit(0);
    }

    // Verificar si el email ya existe (con otro rol)
    const [usuarios] = await db.execute(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [ADMIN_EMAIL]
    );

    if (usuarios.length > 0) {
      console.log('❌ Error: El email', ADMIN_EMAIL, 'ya está registrado con otro rol.');
      console.log('   Por favor, cambia el ADMIN_EMAIL en el archivo .env o en seed_admin.js');
      process.exit(1);
    }

    console.log('📝 Creando nuevo administrador...');

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Insertar el administrador
    const query = `
      INSERT INTO usuarios (email, password, id_rol, estado) 
      VALUES (?, ?, 1, 'activo')
    `;
    
    const [result] = await db.execute(query, [ADMIN_EMAIL, passwordHash]);

    console.log('Email:    ', ADMIN_EMAIL);
    console.log('Password: ', ADMIN_PASSWORD);
    console.log('ID:       ', result.insertId);
    console.log('Rol:      ', 'Administrador (1)');
    
    process.exit(0);
  } catch (error) {
    console.error('\n Error al crear administrador:', error.message);
    process.exit(1);
  }
}

// Ejecutar la función
crearAdministrador();
