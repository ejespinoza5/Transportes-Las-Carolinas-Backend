import { GrupoController } from "../controllers/grupos.controller.js";
import { Router } from "express";
import { verificarToken, esAdmin } from '../middlewares/auth.middleware.js';

const router = Router();
router.get("/", verificarToken, esAdmin, GrupoController.getAll);
router.get("/:id", verificarToken, esAdmin, GrupoController.getById);
router.post("/", verificarToken, esAdmin, GrupoController.create);
router.put("/:id", verificarToken, esAdmin, GrupoController.update);
router.delete("/:id", verificarToken, esAdmin, GrupoController.desactivate);
export default router;