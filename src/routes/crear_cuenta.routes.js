import { Router } from 'express';
import { crearCuentaController } from '../controllers/crear_cuenta.controller.js';

const router = Router();

// POST /api/crear-cuenta - Crear una nueva cuenta de usuario con su casillero
router.post('/', crearCuentaController.crearCuenta);

export default router;
