import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import paqueteRoutes from "./routes/paquete.routes.js";
import estadosRoutes from "./routes/estados.routes.js";
import historialEstadosRoutes from "./routes/historial_estados.routes.js";
import gruposRoutes from "./routes/grupos.routes.js";
import crearCuentaRoutes from "./routes/crear_cuenta.routes.js";
import loginRoutes from "./routes/login.routes.js";
import casilleroClientesRoutes from "./routes/casillero_clientes.routes.js";
import paquetesClientesRoutes from "./routes/paquetes_clientes.routes.js";
import recuperacionPasswordRoutes from "./routes/recuperacion_password.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Si el backend está detrás de Nginx en el mismo servidor, usar la IP real del cliente
app.set("trust proxy", "loopback");

// Cabeceras de seguridad. crossOriginResourcePolicy en "cross-origin" para que el
// front (otro dominio) pueda seguir mostrando las fotos y el PDF.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Configurar CORS
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://lascarolinasenvios.com',
      'https://www.lascarolinasenvios.com',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];
    
    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Ocultar detalles internos (SQL, rutas, etc.) en errores 500.
// El detalle se sigue viendo en el log del servidor (pm2 logs).
app.use((req, res, next) => {
  const jsonOriginal = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 500 && body && typeof body === "object" && !Array.isArray(body)) {
      if (body.detalle || body.error) {
        console.error(`[${req.method} ${req.originalUrl}] Error ${res.statusCode}:`, body.detalle || body.error);
      }
      const { detalle, error, ...resto } = body;
      body = resto;
    }
    return jsonOriginal(body);
  };
  next();
});

// Límites de intentos por IP (contra ataques de fuerza bruta y abuso)
const limitar = (opciones) => rateLimit({
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { ok: false, success: false, message: "Demasiados intentos. Espere unos minutos e intente de nuevo." },
  ...opciones,
});
// Login: 10 intentos FALLIDOS cada 15 min (los exitosos no cuentan)
app.use("/api/login", limitar({ windowMs: 15 * 60 * 1000, limit: 10, skipSuccessfulRequests: true, skip: (req) => req.method !== "POST" || req.path !== "/" }));
// Recuperación de contraseña: 10 solicitudes cada 15 min
app.use("/api/recuperacion", limitar({ windowMs: 15 * 60 * 1000, limit: 10 }));
// Crear cuenta / verificar / reenviar código: 20 cada hora
app.use("/api/crear-cuenta", limitar({ windowMs: 60 * 60 * 1000, limit: 20 }));
// Tracking público: 60 consultas por minuto
app.use("/api/paquetes/estado/guia", limitar({ windowMs: 60 * 1000, limit: 60 }));

// Servir SOLO las fotos de paquetes públicamente.
// (uploads/temp guarda los Excel de importación y NO debe ser público)
app.use("/uploads/paquetes", express.static(path.join(__dirname, "../uploads/paquetes")));

app.use("/api/paquetes", paqueteRoutes);
app.use("/api/estados", estadosRoutes);
app.use("/api/historial-estados", historialEstadosRoutes);
app.use("/api/grupos", gruposRoutes);
app.use("/api/crear-cuenta", crearCuentaRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/casilleros", casilleroClientesRoutes);
app.use("/api/paquetes-clientes", paquetesClientesRoutes);
app.use("/api/recuperacion", recuperacionPasswordRoutes);

// Manejador final de errores no capturados (ej. CORS): responde JSON sin detalles internos
app.use((err, req, res, next) => {
  console.error(`[${req.method} ${req.originalUrl}]`, err);
  if (res.headersSent) return next(err);
  const status = err.message === "Not allowed by CORS" ? 403 : (err.status || 500);
  const message = status === 403 ? "Origen no permitido"
    : (status < 500 && err.expose ? err.message : "Error interno del servidor");
  res.status(status).json({ ok: false, message });
});

export default app;
