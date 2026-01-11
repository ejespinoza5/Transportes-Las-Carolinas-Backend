import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const db = mysql.createPool({
  host: process.env.DB_HOST ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_NAME ,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  timezone: '+00:00' // Forzar UTC
});

// Debug: Mostrar zona horaria
db.execute(`SELECT @@session.time_zone, @@global.time_zone, NOW(), UTC_TIMESTAMP()`)
  .then(([rows]) => {
    console.log('=== ZONA HORARIA BD ===');
    console.log('Session:', rows[0]['@@session.time_zone']);
    console.log('Global:', rows[0]['@@global.time_zone']);
    console.log('NOW():', rows[0]['NOW()']);
    console.log('UTC:', rows[0]['UTC_TIMESTAMP()']);
    console.log('Servidor Node.js:', new Date().toString());
  })
  .catch(err => console.error('Error al verificar zona horaria:', err));
