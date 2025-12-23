import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_cambiala_en_produccion';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const jwtUtils = {
  // Generar token con id_usuario y id_rol
  generarToken(payload) {
    const { id_usuario, id_rol } = payload;
    
    return jwt.sign(
      { 
        id_usuario, 
        id_rol 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  },

  // Verificar y decodificar token
  verificarToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }
};
