import bcrypt from 'bcryptjs';
import { loginModel } from '../models/login.model.js';
import { jwtUtils } from '../utils/jwt.js';

export const loginService = {
  async iniciarSesion(email, password) {
    // Validaciones básicas
    if (!email || !password) {
      throw new Error('Email y contraseña son obligatorios');
    }

    // Buscar usuario por email
    const usuario = await loginModel.buscarUsuarioPorEmail(email);
    
    if (!usuario) {
      throw new Error('Credenciales incorrectas');
    }

    // Verificar que el usuario esté activo
    if (usuario.estado !== 'activo') {
      throw new Error('Usuario inactivo. Contacte al administrador');
    }

    // Verificar que el casillero esté activo (solo para clientes)
    const casilleroActivo = await loginModel.verificarEstadoCasillero(
      usuario.id_usuario,
      usuario.id_rol
    );
    
    if (!casilleroActivo) {
      throw new Error('Su casillero está inactivo. Contacte al administrador');
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    
    if (!passwordValida) {
      throw new Error('Credenciales incorrectas');
    }

    // Actualizar último acceso
    await loginModel.actualizarUltimoAcceso(usuario.id_usuario);

    // Generar token con id_usuario e id_rol
    const token = jwtUtils.generarToken({
      id_usuario: usuario.id_usuario,
      id_rol: usuario.id_rol
    });

    return {
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        id_rol: usuario.id_rol
      }
    };
  }
};
