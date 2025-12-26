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
  },

  // Cambiar contraseña del usuario autenticado
  async cambiarPassword(id_usuario, passwordActual, nuevaPassword) {
    // Validaciones básicas
    if (!passwordActual || !nuevaPassword) {
      throw new Error('Contraseña actual y nueva contraseña son obligatorias');
    }

    // Validar longitud mínima
    if (nuevaPassword.length < 8) {
      throw new Error('La nueva contraseña debe tener al menos 8 caracteres');
    }

    // Validar que contenga al menos una mayúscula
    if (!/[A-Z]/.test(nuevaPassword)) {
      throw new Error('La contraseña debe contener al menos una letra mayúscula');
    }

    // Validar que contenga al menos una minúscula
    if (!/[a-z]/.test(nuevaPassword)) {
      throw new Error('La contraseña debe contener al menos una letra minúscula');
    }

    // Validar que contenga al menos un número
    if (!/[0-9]/.test(nuevaPassword)) {
      throw new Error('La contraseña debe contener al menos un número');
    }

    // Validar que contenga al menos un carácter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(nuevaPassword)) {
      throw new Error('La contraseña debe contener al menos un carácter especial (!@#$%^&*...)');
    }

    // Buscar usuario
    const usuario = await loginModel.buscarUsuarioPorId(id_usuario);
    
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar que la contraseña actual sea correcta
    const passwordValida = await bcrypt.compare(passwordActual, usuario.password);
    
    if (!passwordValida) {
      throw new Error('La contraseña actual es incorrecta');
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    const esIgual = await bcrypt.compare(nuevaPassword, usuario.password);
    if (esIgual) {
      throw new Error('La nueva contraseña debe ser diferente a la actual');
    }

    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const nuevoPasswordHash = await bcrypt.hash(nuevaPassword, salt);

    // Actualizar la contraseña
    const actualizado = await loginModel.actualizarPassword(id_usuario, nuevoPasswordHash);

    if (!actualizado) {
      throw new Error('No se pudo actualizar la contraseña');
    }

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente'
    };
  },

  // Actualizar email del usuario autenticado
  async actualizarEmail(id_usuario, nuevoEmail) {
    // Validaciones básicas
    if (!nuevoEmail) {
      throw new Error('El nuevo email es obligatorio');
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(nuevoEmail)) {
      throw new Error('El formato del email no es válido');
    }

    // Buscar usuario
    const usuario = await loginModel.buscarUsuarioPorId(id_usuario);
    
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar que el nuevo email sea diferente al actual
    if (usuario.email === nuevoEmail) {
      throw new Error('El nuevo email debe ser diferente al actual');
    }

    // Verificar que el email no esté en uso por otro usuario
    const emailExiste = await loginModel.verificarEmailExistente(nuevoEmail, id_usuario);
    
    if (emailExiste) {
      throw new Error('El email ya está registrado por otro usuario');
    }

    // Actualizar el email
    const actualizado = await loginModel.actualizarEmail(id_usuario, nuevoEmail);

    if (!actualizado) {
      throw new Error('No se pudo actualizar el email');
    }

    return {
      success: true,
      message: 'Email actualizado exitosamente',
      data: {
        nuevoEmail
      }
    };
  }
};
