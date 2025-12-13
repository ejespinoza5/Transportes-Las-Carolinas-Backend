import { Router } from "express";
import { EstadoController } from "../controllers/estados.controller.js";

const router = Router();

router.get("/", EstadoController.getAll);
router.get("/:id", EstadoController.getById);
router.post("/", EstadoController.create);
router.put("/:id", EstadoController.update);
router.delete("/:id", EstadoController.deactivate); // desactivar

export default router;
