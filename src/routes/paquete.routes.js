import { Router } from "express";
import multer from "multer";
import { PaqueteController, importarPaquetes } from "../controllers/paquete.controller.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", PaqueteController.getAll);
router.get("/paginacion", PaqueteController.getAllPaginated); // Debe ir antes de /:id
router.get("/guia/:guia", PaqueteController.getByGuia); // Debe ir antes de /:id
router.get("/estado/guia/:guia", PaqueteController.getByGuiaFull);
router.get("/:id", PaqueteController.getById);
router.post("/", PaqueteController.create);
router.post("/importar", upload.single("archivo"), importarPaquetes);
router.put("/:id", PaqueteController.update);
router.put("/estado/:id", PaqueteController.updateEstado);
router.delete("/:id", PaqueteController.deactivate); // desactivar


export default router;
