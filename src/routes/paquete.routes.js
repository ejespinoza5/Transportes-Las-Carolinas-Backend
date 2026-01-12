import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PaqueteController, importarPaquetes } from "../controllers/paquete.controller.js";
import { verificarToken, esAdmin } from '../middlewares/auth.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Configurar directorio para archivos temporales
const uploadsDir = path.join(__dirname, "../../uploads/temp");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'importacion-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 } // Límite 20MB
});

router.get("/", verificarToken, esAdmin, PaqueteController.getAll);
router.get("/paginacion", verificarToken, esAdmin, PaqueteController.getAllPaginated); // Debe ir antes de /:id
router.get("/guia/:guia", verificarToken, esAdmin, PaqueteController.getByGuia); // Debe ir antes de /:id
router.get("/estado/guia/:guia",  PaqueteController.getByGuiaFull);
router.get("/estado/guia/:guia/pdf",  PaqueteController.getByGuiaPDF); // Nueva ruta para generar PDF
router.get("/:id", verificarToken, esAdmin, PaqueteController.getById);
router.post("/", verificarToken, esAdmin, PaqueteController.create);
router.post("/importar", verificarToken, esAdmin, upload.single("archivo"), importarPaquetes);
router.post("/estado/multiple", verificarToken, esAdmin, PaqueteController.updateEstadoMultiple); // Actualizar múltiples estados
router.post("/eliminar/multiple", verificarToken, esAdmin, PaqueteController.deactivateMultiple); // Desactivar múltiples paquetes
router.put("/:id", verificarToken, esAdmin, PaqueteController.update);
router.put("/estado/:id", verificarToken, esAdmin, PaqueteController.updateEstado);
router.delete("/:id", verificarToken, esAdmin, PaqueteController.deactivate); // desactivar


export default router;
