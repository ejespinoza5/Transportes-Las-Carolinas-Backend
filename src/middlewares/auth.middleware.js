import { jwtUtils } from '../utils/jwt.js';

// Middleware para verificar que el usuario esté autenticado
export const verificarToken = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado. Acceso denegado'
      });
    }

    // El formato debe ser: "Bearer TOKEN"
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    // Verificar y decodificar el token
    const decoded = jwtUtils.verificarToken(token);

    // Agregar los datos del usuario al request
    req.usuario = {
      id_usuario: decoded.id_usuario,
      id_rol: decoded.id_rol
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};

// Middleware para verificar que el usuario sea administrador (id_rol = 1)
export const esAdmin = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  if (req.usuario.id_rol !== 1) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de administrador'
    });
  }

  next();
};

// Middleware para verificar que el usuario sea cliente (id_rol = 2)
export const esCliente = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  if (req.usuario.id_rol !== 2) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de cliente'
    });
  }

  next();
};

// Middleware para verificar que sea admin o el mismo usuario
export const esAdminOMismUsuario = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  // Obtener el id_usuario de los parámetros o del body
  const idUsuarioSolicitado = parseInt(req.params.id_usuario || req.body.id_usuario);

  // Permitir si es admin o si es el mismo usuario
  if (req.usuario.id_rol === 1 || req.usuario.id_usuario === idUsuarioSolicitado) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. No tienes permisos para realizar esta acción'
    });
  }
};
