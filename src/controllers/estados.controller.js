import { EstadoService } from "../services/estados.service.js";
export const EstadoController = {
    getAll: async (req, res) => {
            const estados = await EstadoService.getAll();
            res.json(estados);
        },
    
        getById: async (req, res) => {
            const estado = await EstadoService.getById(req.params.id);
    
            if (!estado) {
                return res.status(404).json({ message: "Estado no encontrado" });
            }
    
            res.json(estado);
        },
    
        create: async (req, res) => {
            try {
                const id = await EstadoService.create(req.body);
    
                res.status(201).json({
                    ok: true,
                    message: "Estado creado correctamente",
                    id: id
                });
    
            } catch (error) {
                res.status(error.status || 500).json({
                    ok: false,
                    message: error.message || "Error desconocido",
                    detalle: error.detalle || null
                });
            }
        },
    
        update: async (req, res) => {
            try {
                const affectedRows = await EstadoService.update(req.params.id, req.body);
    
                if (affectedRows === 0) {
                    return res.status(404).json({ message: "Estado no encontrado o sin cambios" });
                }
                res.json({ message: "Estado actualizado correctamente" });
            } catch (error) {
                res.status(error.status || 500).json({
                    ok: false,
                    message: error.message || "Error desconocido",
                    detalle: error.detalle || null
                });
            }
        },
    
        deactivate: async (req, res) => {
            await EstadoService.deactivate(req.params.id);
            res.json({ message: "Estado marcado como inactivo" });
        },
}