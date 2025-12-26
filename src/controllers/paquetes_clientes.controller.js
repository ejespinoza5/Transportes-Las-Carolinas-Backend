import { PaquetesClientesService } from "../services/paquetes_clientes.service.js";
import { casilleroClienteModel } from "../models/casillero_clientes.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PaquetesClientesController = {
  // Obtener todos los paquetes asignados (solo admin)
  getAll: async (req, res) => {
    try {
      const paquetes = await PaquetesClientesService.getAll();
      
      // Agrupar paquetes por cliente
      const clientesMap = {};
      
      paquetes.forEach(paquete => {
        const idCliente = paquete.id_cliente;
        
        if (!clientesMap[idCliente]) {
          clientesMap[idCliente] = {
            id_cliente: paquete.id_cliente,
            nombre_cliente: paquete.nombre_cliente,
            apellido_cliente: paquete.apellido_cliente,
            cod_casillero: paquete.cod_casillero,
            paquetes: []
          };
        }
        
        // Agregar paquete sin datos del cliente
        clientesMap[idCliente].paquetes.push({
          id_asignacion: paquete.id_asignacion,
          id_Paquete: paquete.id_Paquete,
          peso_lb: paquete.peso_lb,
          foto_paquete: paquete.foto_paquete,
          observaciones: paquete.observaciones,
          fecha_asignacion: paquete.fecha_asignacion,
          hora_asignacion: paquete.hora_asignacion,
          Guia: paquete.Guia,
          Servicio: paquete.Servicio,
          Courier: paquete.Courier,
          id_estado: paquete.id_estado,
          guia_tramaco: paquete.guia_tramaco,
          nombre_estado: paquete.nombre_estado
        });
      });
      
      // Convertir el objeto a array
      const clientesConPaquetes = Object.values(clientesMap);
      
      res.json({
        ok: true,
        data: clientesConPaquetes
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        message: "Error al obtener las asignaciones",
        detalle: error.message
      });
    }
  },

  // Obtener paquetes de un cliente específico (admin o cliente propio)
  getByCliente: async (req, res) => {
    try {
      const { id_cliente } = req.params;
      
      // Si es cliente, verificar que sea su propio casillero
      if (req.usuario.id_rol === 2) {
        const casillero = await casilleroClienteModel.obtenerPorUsuario(req.usuario.id_usuario);
        
        if (!casillero || casillero.id !== parseInt(id_cliente)) {
          return res.status(403).json({
            ok: false,
            message: "No tienes permiso para ver los paquetes de otro cliente"
          });
        }
      }

      const paquetes = await PaquetesClientesService.getByCliente(id_cliente);
      res.json({
        ok: true,
        data: paquetes
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        message: "Error al obtener los paquetes del cliente",
        detalle: error.message
      });
    }
  },

  // Obtener paquetes del cliente autenticado
  getMisPaquetes: async (req, res) => {
    try {
      // Obtener id_usuario del token
      const id_usuario = req.usuario.id_usuario;
      
      // Buscar el casillero del cliente usando id_usuario
      const casillero = await casilleroClienteModel.obtenerPorUsuario(id_usuario);
      
      if (!casillero) {
        return res.status(404).json({
          ok: false,
          message: "No tienes un casillero asignado"
        });
      }
      
      // Obtener paquetes usando el id del casillero
      const paquetes = await PaquetesClientesService.getByCliente(casillero.id);
      
      res.json({
        ok: true,
        data: paquetes
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        message: "Error al obtener tus paquetes",
        detalle: error.message
      });
    }
  },

  // Obtener una asignación por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const asignacion = await PaquetesClientesService.getById(id);

      if (!asignacion) {
        return res.status(404).json({
          ok: false,
          message: "Asignación no encontrada"
        });
      }

      // Si es cliente, solo puede ver su propia asignación
      if (req.usuario.id_rol === 2) {
        const casillero = await casilleroClienteModel.obtenerPorUsuario(req.usuario.id_usuario);
        
        if (!casillero || casillero.id !== asignacion.id_cliente) {
          return res.status(403).json({
            ok: false,
            message: "No tienes permiso para ver esta asignación"
          });
        }
      }

      res.json({
        ok: true,
        data: asignacion
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        message: "Error al obtener la asignación",
        detalle: error.message
      });
    }
  },

  // Crear nueva asignación (solo admin)
  create: async (req, res) => {
    try {
      // Limpiar nombres de campos (eliminar espacios)
      const cleanBody = {};
      for (let key in req.body) {
        cleanBody[key.trim()] = req.body[key];
      }
      
      const { id_Paquete, id_cliente, peso_lb, observaciones } = cleanBody;

      // Validaciones
      if (!id_Paquete || !id_cliente) {
        return res.status(400).json({
          ok: false,
          message: "El id_Paquete y id_cliente son obligatorios"
        });
      }

      const data = {
        id_Paquete,
        id_cliente,
        peso_lb: peso_lb && peso_lb !== '' ? parseFloat(peso_lb.toString().replace(',', '.')) : null,
        foto_paquete: req.file ? req.file.filename : null,
        observaciones: observaciones || null
      };



      const id_asignacion = await PaquetesClientesService.create(data);

      res.status(201).json({
        ok: true,
        message: "Paquete asignado al cliente exitosamente",
        id_asignacion
      });
    } catch (error) {
      // Si hay error, eliminar la imagen subida
      if (req.file) {
        const filePath = path.join(__dirname, "../../uploads/paquetes", req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      res.status(400).json({
        ok: false,
        message: error.message
      });
    }
  },

  // Actualizar asignación (solo admin)
  update: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Limpiar nombres de campos (eliminar espacios)
      const cleanBody = {};
      for (let key in req.body) {
        cleanBody[key.trim()] = req.body[key];
      }
      
      const { id_Paquete, id_cliente, peso_lb, observaciones } = cleanBody;

      // Validaciones
      if (!id_Paquete || !id_cliente) {
        return res.status(400).json({
          ok: false,
          message: "El id_Paquete y id_cliente son obligatorios"
        });
      }

      // Si hay nueva foto, eliminar la anterior
      let nuevaFoto = null;
      if (req.file) {
        nuevaFoto = req.file.filename;
        const fotoAnterior = await PaquetesClientesService.getFoto(id);
        if (fotoAnterior) {
          const filePath = path.join(__dirname, "../../uploads/paquetes", fotoAnterior);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }

      const data = {
        id_Paquete,
        id_cliente,
        peso_lb: peso_lb && peso_lb !== '' ? parseFloat(peso_lb.toString().replace(',', '.')) : null,
        foto_paquete: nuevaFoto, // null si no hay nueva foto
        observaciones: observaciones || null
      };

      const affectedRows = await PaquetesClientesService.update(id, data);

      if (affectedRows === 0) {
        return res.status(404).json({
          ok: false,
          message: "Asignación no encontrada"
        });
      }

      res.json({
        ok: true,
        message: "Asignación actualizada exitosamente"
      });
    } catch (error) {
      // Si hay error, eliminar la nueva imagen subida
      if (req.file) {
        const filePath = path.join(__dirname, "../../uploads/paquetes", req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      res.status(400).json({
        ok: false,
        message: error.message
      });
    }
  },

  // Eliminar asignación (solo admin)
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      // Opcional: eliminar también la foto
      const fotoAnterior = await PaquetesClientesService.getFoto(id);
      if (fotoAnterior) {
        const filePath = path.join(__dirname, "../../uploads/paquetes", fotoAnterior);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      const affectedRows = await PaquetesClientesService.delete(id);

      if (affectedRows === 0) {
        return res.status(404).json({
          ok: false,
          message: "Asignación no encontrada"
        });
      }

      res.json({
        ok: true,
        message: "Asignación eliminada exitosamente"
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        message: error.message
      });
    }
  }
};
