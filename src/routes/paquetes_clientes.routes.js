import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
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

// Usar memoryStorage para procesar con Sharp antes de guardar
const storage = multer.memoryStorage();

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos de imagen (JPEG, JPG)"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 MB máximo
  }
});

// Middleware para comprimir imágenes con Sharp
const compressImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = "paquete-" + uniqueSuffix + ".jpg";
    const filepath = path.join(uploadsDir, filename);

    // Comprimir imagen con Sharp
    await sharp(req.file.buffer)
      .resize(1920, 1920, { // Máximo 1920px (mantiene aspecto)
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 }) // Calidad 80% (buen balance)
      .toFile(filepath);

    // Actualizar req.file con el nombre del archivo guardado
    req.file.filename = filename;
    req.file.path = filepath;

    next();
  } catch (error) {
    next(new Error("Error al procesar la imagen: " + error.message));
  }
};

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
  (req, res, next) => {
    upload.single("foto_paquete")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Error de multer (tamaño, etc.)
        return res.status(400).json({
          ok: false,
          message: err.code === 'LIMIT_FILE_SIZE' 
            ? 'El archivo excede el tamaño máximo permitido (20 MB)' 
            : 'Error al subir el archivo',
          detalle: err.message
        });
      } else if (err) {
        // Error personalizado (tipo de archivo)
        return res.status(400).json({
          ok: false,
          message: err.message
        });
      }
      next();
    });
  },
  compressImage, // Comprimir imagen
  PaquetesClientesController.create
);

// Actualizar asignación (solo admin)
router.put(
  "/:id",
  verificarToken,
  esAdmin,
  (req, res, next) => {
    upload.single("foto_paquete")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Error de multer (tamaño, etc.)
        return res.status(400).json({
          ok: false,
          message: err.code === 'LIMIT_FILE_SIZE' 
            ? 'El archivo excede el tamaño máximo permitido (20 MB)' 
            : 'Error al subir el archivo',
          detalle: err.message
        });
      } else if (err) {
        // Error personalizado (tipo de archivo)
        return res.status(400).json({
          ok: false,
          message: err.message
        });
      }
      next();
    });
  },
  compressImage, // Comprimir imagen
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
