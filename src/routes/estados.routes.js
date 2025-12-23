import { Router } from "express";
import { EstadoController } from "../controllers/estados.controller.js";
import { verificarToken, esAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.get("/",  EstadoController.getAll);
router.get("/:id",  EstadoController.getById);
router.post("/", verificarToken, esAdmin, EstadoController.create);
router.put("/:id", verificarToken, esAdmin, EstadoController.update);
router.delete("/:id", verificarToken, esAdmin, EstadoController.deactivate); // desactivar

export default router;
