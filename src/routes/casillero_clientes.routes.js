import { Router } from 'express';
import { verificarToken, esAdmin } from '../middlewares/auth.middleware.js';
import { casilleroClienteController } from '../controllers/casillero_clientes.controller.js';

const router = Router();

// GET /api/casilleros/mi-casillero - Obtener mi casillero (cliente autenticado)
router.get('/mi-casillero', verificarToken, casilleroClienteController.obtenerMiCasillero);

// GET /api/casilleros/paginacion - Obtener todos los casilleros con paginación (solo admin)
router.get('/paginacion', verificarToken, esAdmin, casilleroClienteController.obtenerTodosPaginados);

// GET /api/casilleros - Obtener todos los casilleros (solo admin)
router.get('/', verificarToken, esAdmin, casilleroClienteController.obtenerTodos);

// GET /api/casilleros/codigo/:cod_casillero - Obtener casillero por código (solo admin)
router.get('/codigo/:cod_casillero', verificarToken, esAdmin, casilleroClienteController.obtenerPorCodigo);


router.put('/:id', verificarToken, casilleroClienteController.actualizar);

export default router;
