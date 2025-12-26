import { casilleroClienteModel } from '../models/casillero_clientes.model.js';

export const casilleroClienteService = {
  // Obtener casillero del usuario autenticado
  async obtenerMiCasillero(id_usuario) {
    const casillero = await casilleroClienteModel.obtenerPorUsuario(id_usuario);
    
    if (!casillero) {
      throw new Error('No se encontró un casillero para este usuario');
    }

    return {
      success: true,
      data: casillero
    };
  },

  // Obtener todos los casilleros (solo admin)
  async obtenerTodosCasilleros() {
    const casilleros = await casilleroClienteModel.obtenerTodos();
    
    return {
      success: true,
      total: casilleros.length,
      data: casilleros
    };
  },

  // Obtener todos los casilleros con paginación (solo admin)
  async obtenerTodosCasillerosPaginados(page = 1, limit = 10, filtros = {}) {
    const resultado = await casilleroClienteModel.obtenerTodosPaginados(
      parseInt(page),
      parseInt(limit),
      filtros
    );
    
    return {
      success: true,
      ...resultado
    };
  },

  // Obtener casillero por código (admin)
  async obtenerPorCodigo(cod_casillero) {
    const casillero = await casilleroClienteModel.obtenerPorCodigoCasillero(cod_casillero);
    
    if (!casillero) {
      throw new Error('Casillero no encontrado');
    }

    return {
      success: true,
      data: casillero
    };
  },

  // Actualizar datos del casillero
  async actualizarCasillero(id, datosActualizar, id_usuario_solicitante, id_rol) {
    // Verificar que el casillero existe
    const casillero = await casilleroClienteModel.obtenerPorId(id);
    
    if (!casillero) {
      throw new Error('Casillero no encontrado');
    }

    // Verificar permisos: admin puede modificar cualquiera, cliente solo el suyo
    if (id_rol !== 1 && casillero.id_usuario !== id_usuario_solicitante) {
      throw new Error('No tienes permisos para modificar este casillero');
    }

    // Solo admin puede cambiar el estado
    if (datosActualizar.estado && id_rol !== 1) {
      throw new Error('Solo el administrador puede cambiar el estado del casillero');
    }

    // Validar estado si se envía
    if (datosActualizar.estado && !['activo', 'inactivo'].includes(datosActualizar.estado)) {
      throw new Error('Estado debe ser "activo" o "inactivo"');
    }

    // Si se intenta cambiar el email, validar y actualizar
    if (datosActualizar.email) {
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(datosActualizar.email)) {
        throw new Error('El formato del email no es válido');
      }

      // Verificar que el email no esté en uso por otro usuario
      const emailExiste = await casilleroClienteModel.verificarEmailExistente(
        datosActualizar.email,
        casillero.id_usuario
      );
      
      if (emailExiste) {
        throw new Error('El email ya está registrado por otro usuario');
      }

      // Actualizar el email del usuario
      await casilleroClienteModel.actualizarEmailUsuario(
        casillero.id_usuario,
        datosActualizar.email
      );

      // Remover email de datosActualizar para que no intente actualizarlo en casilleros_clientes
      delete datosActualizar.email;
    }

    // Si se intenta cambiar la cédula, verificar que no exista
    if (datosActualizar.cedula && datosActualizar.cedula !== casillero.cedula) {
      const cedulaExiste = await casilleroClienteModel.verificarCedulaExistente(
        datosActualizar.cedula,
        id
      );
      
      if (cedulaExiste) {
        throw new Error('La cédula ya está registrada en otro casillero');
      }
    }

    // Validar tipo_entrega si se envía
    if (datosActualizar.tipo_entrega && 
        !['domicilio', 'oficina'].includes(datosActualizar.tipo_entrega)) {
      throw new Error('Tipo de entrega debe ser "domicilio" u "oficina"');
    }

    // Si se cambia el estado del casillero, también cambiar el estado del usuario
    if (datosActualizar.estado) {
      await casilleroClienteModel.actualizarEstadoUsuario(
        casillero.id_usuario,
        datosActualizar.estado
      );
    }

    // Actualizar solo los campos enviados (si hay campos para actualizar)
    if (Object.keys(datosActualizar).length > 0) {
      const actualizado = await casilleroClienteModel.actualizar(id, datosActualizar);

      if (!actualizado) {
        throw new Error('No se pudo actualizar el casillero');
      }
    }

    // Obtener el casillero actualizado
    const casilleroActualizado = await casilleroClienteModel.obtenerPorId(id);

    return {
      success: true,
      message: 'Casillero actualizado exitosamente',
      data: casilleroActualizado
    };
  },

  // Dar de baja (cliente inactiva su propia cuenta)
  async darDeBaja(id_usuario) {
    // Verificar que el casillero existe
    const casillero = await casilleroClienteModel.obtenerPorUsuario(id_usuario);
    
    if (!casillero) {
      throw new Error('No se encontró un casillero asociado a este usuario');
    }

    // Verificar que no esté ya inactivo
    if (casillero.estado === 'inactivo') {
      throw new Error('Su casillero ya está inactivo');
    }

    // Inactivar casillero y usuario
    const actualizado = await casilleroClienteModel.darDeBaja(id_usuario);

    if (!actualizado) {
      throw new Error('No se pudo dar de baja el casillero');
    }

    return {
      success: true,
      message: 'Su cuenta ha sido dada de baja exitosamente. Ya no podrá iniciar sesión.'
    };
  }
};
