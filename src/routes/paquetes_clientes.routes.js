import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { PaquetesClientesController } from "../controllers/paquetes_clientes.controller.js";
import { verificarToken, esAdmin } from "../middlewares/auth.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configurar multer para subir imágenes
const uploadsDir = path.join(__dirname, "../../uploads/paquetes");

// Crear directorio si no existe
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "paquete-" + uniqueSuffix + ext);
  }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos de imagen (JPEG, PNG)"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB máximo
  }
});

// ===== RUTAS PROTEGIDAS =====

// Obtener todos los paquetes asignados (solo admin)
router.get("/", verificarToken, esAdmin, PaquetesClientesController.getAll);

// Obtener paquetes del cliente autenticado (cliente o admin)
router.get("/mis-paquetes", verificarToken, PaquetesClientesController.getMisPaquetes);

// Obtener paquetes de un cliente específico (admin o cliente propio)
router.get("/cliente/:id_cliente", verificarToken, PaquetesClientesController.getByCliente);

// Obtener asignación por ID (admin o cliente propio)
router.get("/:id", verificarToken, PaquetesClientesController.getById);

// Crear nueva asignación (solo admin)
router.post(
  "/",
  verificarToken,
  esAdmin,
  upload.single("foto_paquete"),
  PaquetesClientesController.create
);

// Actualizar asignación (solo admin)
router.put(
  "/:id",
  verificarToken,
  esAdmin,
  upload.single("foto_paquete"),
  PaquetesClientesController.update
);

// Eliminar asignación (solo admin)
router.delete("/:id", verificarToken, esAdmin, PaquetesClientesController.delete);

// Ruta para servir las imágenes
router.get("/imagen/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadsDir, filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      ok: false,
      message: "Imagen no encontrada"
    });
  }
});

export default router;
