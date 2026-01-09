import { Router } from 'express';
import { crearCuentaController } from '../controllers/crear_cuenta.controller.js';

const router = Router();

// POST /api/crear-cuenta - Crear una nueva cuenta de usuario con su casillero
router.post('/', crearCuentaController.crearCuenta);

// POST /api/crear-cuenta/verificar-email - Verificar código de verificación de email
router.post('/verificar-email', crearCuentaController.verificarEmail);

// POST /api/crear-cuenta/reenviar-codigo - Reenviar código de verificación
router.post('/reenviar-codigo', crearCuentaController.reenviarCodigo);

// POST /api/crear-cuenta/cambiar-email - Cambiar email si aún no está verificado
router.post('/cambiar-email', crearCuentaController.cambiarEmail);

export default router;
