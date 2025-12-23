import { Router } from 'express';
import { loginController } from '../controllers/login.controller.js';

const router = Router();

// POST /api/login - Iniciar sesión
router.post('/', loginController.login);

export default router;
