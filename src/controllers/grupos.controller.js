import { GrupoService } from "../services/grupos.service.js";
export const GrupoController = {
    getAll: async (req, res) => {
        const grupos = await GrupoService.getAll();
        res.json(grupos);
    },
    getById: async (req, res) => {
        const grupo = await GrupoService.getById(req.params.id);
        if (!grupo) {
            return res.status(404).json({ message: "Grupo no encontrado" });
        }
        res.json(grupo);
    },
    create: async (req, res) => {
        try {
            const id = await GrupoService.create(req.body);
            res.status(201).json({
                ok: true,
                message: "Grupo creado correctamente",
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
            const affectedRows = await GrupoService.update(req.params.id, req.body);
            if (affectedRows === 0) {
                return res.status(404).json({ message: "Grupo no encontrado o sin cambios" });
            }
            res.json({
                ok: true,
                message: "Grupo actualizado correctamente"
            });
        } catch (error) {
            res.status(error.status || 500).json({
                ok: false,
                message: error.message || "Error desconocido",
                detalle: error.detalle || null
            });
        }
    },
    desactivate: async (req, res) => {
        try {
            const resultado = await GrupoService.desactivate(req.params.id);
            res.json(resultado);
        } catch (error) {
            res.status(error.status || 500).json({
                ok: false,
                message: error.message || "Error desconocido",
                detalle: error.detalle || null
            });
        }
    },
}