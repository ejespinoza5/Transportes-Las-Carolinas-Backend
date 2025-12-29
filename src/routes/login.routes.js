import { Router } from 'express';
import { loginController, cambiarPasswordController, actualizarEmailController, actualizarEmailAdminController } from '../controllers/login.controller.js';
import { verificarToken, esAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/login - Iniciar sesión
router.post('/', loginController.login);

// PUT /api/login/cambiar-password - Cambiar contraseña (usuario autenticado)
router.put('/cambiar-password', verificarToken, cambiarPasswordController.cambiarPassword);

// PUT /api/login/cambiar-email - Cambiar email (usuario autenticado)
router.put('/cambiar-email', verificarToken, actualizarEmailController.actualizarEmail);

// PUT /api/login/admin/actualizar-email - Actualizar email de cualquier usuario (solo admin)
router.put('/admin/actualizar-email', verificarToken, esAdmin, actualizarEmailAdminController.actualizarEmailPorAdmin);

export default router;
