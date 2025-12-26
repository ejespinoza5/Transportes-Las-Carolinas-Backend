import express from 'express';
import { recuperacionPasswordController } from '../controllers/recuperacion_password.controller.js';

const router = express.Router();

// Solicitar código de recuperación
router.post('/solicitar', recuperacionPasswordController.solicitarRecuperacion);

// Verificar código de recuperación
router.post('/verificar', recuperacionPasswordController.verificarCodigo);

// Cambiar contraseña
router.post('/cambiar-password', recuperacionPasswordController.cambiarPassword);

export default router;
