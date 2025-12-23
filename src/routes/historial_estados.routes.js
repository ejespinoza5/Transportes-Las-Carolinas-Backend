import { Router } from "express";
import { HistorialEstadosController } from "../controllers/historial_estados.controller.js";
import { verificarToken, esAdmin } from '../middlewares/auth.middleware.js';
const router = Router();

router.get("/", verificarToken, esAdmin, HistorialEstadosController.getAll);
router.get("/:id", verificarToken, esAdmin, HistorialEstadosController.getById);
router.get("/paquete/:id_paquete", verificarToken, esAdmin, HistorialEstadosController.getByPaquete);
router.put("/:id", verificarToken, esAdmin, HistorialEstadosController.update);
router.delete("/:id", verificarToken, esAdmin, HistorialEstadosController.deactivate);

export default router;
