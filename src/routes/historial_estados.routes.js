import { Router } from "express";
import { HistorialEstadosController } from "../controllers/historial_estados.controller.js";

const router = Router();

router.get("/", HistorialEstadosController.getAll);
router.get("/:id", HistorialEstadosController.getById);
router.get("/paquete/:id_paquete", HistorialEstadosController.getByPaquete);
router.put("/:id", HistorialEstadosController.update);
router.delete("/:id", HistorialEstadosController.deactivate);

export default router;
