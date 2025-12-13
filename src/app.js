import express from "express";
import cors from "cors";
import paqueteRoutes from "./routes/paquete.routes.js";
import estadosRoutes from "./routes/estados.routes.js";
import historialEstadosRoutes from "./routes/historial_estados.routes.js";


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

export default app;
