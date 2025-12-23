import express from "express";
import cors from "cors";
import paqueteRoutes from "./routes/paquete.routes.js";
import estadosRoutes from "./routes/estados.routes.js";
import historialEstadosRoutes from "./routes/historial_estados.routes.js";
import gruposRoutes from "./routes/grupos.routes.js";
import crearCuentaRoutes from "./routes/crear_cuenta.routes.js";
import loginRoutes from "./routes/login.routes.js";
import casilleroClientesRoutes from "./routes/casillero_clientes.routes.js";


const app = express();

// Configurar CORS
app.use(cors({
  origin: '*', // Permite todos los orígenes (cambiar en producción)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  credentials: true
}));

app.use(express.json());

app.use("/api/paquetes", paqueteRoutes);
app.use("/api/estados", estadosRoutes);
app.use("/api/historial-estados", historialEstadosRoutes);
app.use("/api/grupos", gruposRoutes);
app.use("/api/crear-cuenta", crearCuentaRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/casilleros", casilleroClientesRoutes);

export default app;
