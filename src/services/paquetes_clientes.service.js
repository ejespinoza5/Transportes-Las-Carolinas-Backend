import { PaquetesClientesModel } from "../models/paquetes_clientes.model.js";

export const PaquetesClientesService = {
  // Obtener todos los paquetes asignados (admin)
  getAll: async () => {
    return await PaquetesClientesModel.getAll();
  },

  // Obtener paquetes de un cliente específico
  getByCliente: async (id_cliente) => {
    return await PaquetesClientesModel.getByCliente(id_cliente);
  },

  // Obtener una asignación por ID
  getById: async (id_asignacion) => {
    return await PaquetesClientesModel.getById(id_asignacion);
  },

  // Crear nueva asignación
  create: async (data) => {
    // Verificar que el paquete existe
    const paqueteExiste = await PaquetesClientesModel.existePaquete(data.id_Paquete);
    if (!paqueteExiste) {
      throw new Error("El paquete no existe o está inactivo");
    }

    // Verificar que el cliente existe
    const clienteExiste = await PaquetesClientesModel.existeCliente(data.id_cliente);
    if (!clienteExiste) {
      throw new Error("El cliente no existe en el sistema");
    }

    // Verificar si el paquete ya está asignado
    const yaAsignado = await PaquetesClientesModel.isPaqueteAsignado(data.id_Paquete);
    if (yaAsignado) {
      throw new Error("Este paquete ya está asignado a un cliente");
    }

    return await PaquetesClientesModel.create(data);
  },

  // Actualizar asignación
  update: async (id_asignacion, data) => {
    // Verificar que exista
    const exists = await PaquetesClientesModel.exists(id_asignacion);
    if (!exists) {
      throw new Error("La asignación no existe");
    }

    // Verificar que el paquete existe
    const paqueteExiste = await PaquetesClientesModel.existePaquete(data.id_Paquete);
    if (!paqueteExiste) {
      throw new Error("El paquete no existe o está inactivo");
    }

    // Verificar que el cliente existe
    const clienteExiste = await PaquetesClientesModel.existeCliente(data.id_cliente);
    if (!clienteExiste) {
      throw new Error("El cliente no existe en el sistema");
    }

    // Si se está cambiando el paquete, verificar que no esté asignado a otro cliente
    const asignacionActual = await PaquetesClientesModel.getById(id_asignacion);
    if (data.id_Paquete && data.id_Paquete !== asignacionActual.id_Paquete) {
      // Excluir la asignación actual de la verificación
      const yaAsignado = await PaquetesClientesModel.isPaqueteAsignado(data.id_Paquete, id_asignacion);
      if (yaAsignado) {
        throw new Error("Este paquete ya está asignado a otro cliente");
      }
    }

    return await PaquetesClientesModel.update(id_asignacion, data);
  },

  // Eliminar asignación
  delete: async (id_asignacion) => {
    const exists = await PaquetesClientesModel.exists(id_asignacion);
    if (!exists) {
      throw new Error("La asignación no existe");
    }

    return await PaquetesClientesModel.delete(id_asignacion);
  },

  // Obtener foto para eliminarla
  getFoto: async (id_asignacion) => {
    return await PaquetesClientesModel.getFoto(id_asignacion);
  }
};
