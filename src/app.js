import express from "express";
import cors from "cors";
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

// Configurar CORS
app.use(cors({
  origin: '*', // Permite todos los orígenes (cambiar en producción)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  credentials: true
}));

app.use(express.json());

// Servir archivos estáticos (imágenes) - ACCESIBLE PÚBLICAMENTE
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/paquetes", paqueteRoutes);
app.use("/api/estados", estadosRoutes);
app.use("/api/historial-estados", historialEstadosRoutes);
app.use("/api/grupos", gruposRoutes);
app.use("/api/crear-cuenta", crearCuentaRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/casilleros", casilleroClientesRoutes);
app.use("/api/paquetes-clientes", paquetesClientesRoutes);
app.use("/api/recuperacion", recuperacionPasswordRoutes);

export default app;
