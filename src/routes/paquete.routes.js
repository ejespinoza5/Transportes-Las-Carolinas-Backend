import { Router } from "express";
import multer from "multer";
import { PaqueteController, importarPaquetes } from "../controllers/paquete.controller.js";
import { verificarToken, esAdmin } from '../middlewares/auth.middleware.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", verificarToken, esAdmin, PaqueteController.getAll);
router.get("/paginacion", verificarToken, esAdmin, PaqueteController.getAllPaginated); // Debe ir antes de /:id
router.get("/guia/:guia", verificarToken, esAdmin, PaqueteController.getByGuia); // Debe ir antes de /:id
router.get("/estado/guia/:guia",  PaqueteController.getByGuiaFull);
router.get("/:id", verificarToken, esAdmin, PaqueteController.getById);
router.post("/", verificarToken, esAdmin, PaqueteController.create);
router.post("/importar", verificarToken, esAdmin, upload.single("archivo"), importarPaquetes);
router.post("/estado/multiple", verificarToken, esAdmin, PaqueteController.updateEstadoMultiple); // Actualizar múltiples estados
router.post("/eliminar/multiple", verificarToken, esAdmin, PaqueteController.deactivateMultiple); // Desactivar múltiples paquetes
router.put("/:id", verificarToken, esAdmin, PaqueteController.update);
router.put("/estado/:id", verificarToken, esAdmin, PaqueteController.updateEstado);
router.delete("/:id", verificarToken, esAdmin, PaqueteController.deactivate); // desactivar


export default router;
