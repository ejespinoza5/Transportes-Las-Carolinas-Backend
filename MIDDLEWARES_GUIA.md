# 🔐 Guía de Uso de Middlewares de Autenticación

## Middlewares Disponibles

### 1. `verificarToken`
Verifica que el usuario tenga un token JWT válido. Agrega `req.usuario` con los datos del token.

### 2. `esAdmin`
Verifica que el usuario autenticado sea administrador (id_rol = 1).

### 3. `esCliente`
Verifica que el usuario autenticado sea cliente (id_rol = 2).

### 4. `esAdminOMismUsuario`
Permite acceso si es admin o si es el mismo usuario solicitado.

---

## Cómo Usar los Middlewares

### Ejemplo 1: Rutas solo para administradores

```javascript
import { Router } from 'express';
import { verificarToken, esAdmin } from '../middlewares/auth.middleware.js';
import { EstadoController } from '../controllers/estados.controller.js';

const router = Router();

// Rutas públicas (sin middleware)
router.get('/', EstadoController.getAll);

// Rutas protegidas solo para ADMIN
router.post('/', verificarToken, esAdmin, EstadoController.create);
router.put('/:id', verificarToken, esAdmin, EstadoController.update);
router.delete('/:id', verificarToken, esAdmin, EstadoController.deactivate);

export default router;
```

### Ejemplo 2: Rutas para usuarios autenticados (admin o cliente)

```javascript
import { Router } from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { PaqueteController } from '../controllers/paquete.controller.js';

const router = Router();

// Cualquier usuario autenticado puede ver paquetes
router.get('/', verificarToken, PaqueteController.getAll);
router.get('/:id', verificarToken, PaqueteController.getById);

export default router;
```

### Ejemplo 3: Rutas mixtas (admin crea, todos ven)

```javascript
import { Router } from 'express';
import { verificarToken, esAdmin } from '../middlewares/auth.middleware.js';
import { GrupoController } from '../controllers/grupos.controller.js';

const router = Router();

// Todos los autenticados pueden ver
router.get('/', verificarToken, GrupoController.getAll);
router.get('/:id', verificarToken, GrupoController.getById);

// Solo admin puede crear/modificar/eliminar
router.post('/', verificarToken, esAdmin, GrupoController.create);
router.put('/:id', verificarToken, esAdmin, GrupoController.update);
router.delete('/:id', verificarToken, esAdmin, GrupoController.deactivate);

export default router;
```

### Ejemplo 4: Cliente solo puede ver sus propios datos

```javascript
import { Router } from 'express';
import { verificarToken, esAdminOMismUsuario } from '../middlewares/auth.middleware.js';
import { CasilleroController } from '../controllers/casillero_clientes.controller.js';

const router = Router();

// Admin ve todos, cliente solo ve el suyo
router.get('/:id_usuario', verificarToken, esAdminOMismUsuario, CasilleroController.getByCasillero);

export default router;
```

---

## Aplicación por Tipo de Ruta

### 🔓 Rutas Públicas (sin autenticación)
- POST /api/crear-cuenta
- POST /api/login

### 🔐 Rutas para Usuarios Autenticados
- GET /api/paquetes
- GET /api/paquetes/:id
- GET /api/casilleros/:id_usuario (solo su propio casillero)

### 👑 Rutas Solo para Administradores
- POST /api/estados
- PUT /api/estados/:id
- DELETE /api/estados/:id
- POST /api/paquetes/importar
- PUT /api/paquetes/:id
- DELETE /api/paquetes/:id

---

## Headers para Peticiones Autenticadas

```javascript
// Ejemplo en fetch
fetch('http://localhost:3000/api/paquetes', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer TU_TOKEN_AQUI',
    'Content-Type': 'application/json'
  }
})
```

```javascript
// Ejemplo en Axios
axios.get('http://localhost:3000/api/paquetes', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## En el Controlador: Acceder a Datos del Usuario

Después de pasar por `verificarToken`, puedes acceder a los datos del usuario en `req.usuario`:

```javascript
export const miControlador = {
  async miFuncion(req, res) {
    // Datos del usuario autenticado
    const { id_usuario, id_rol } = req.usuario;
    
    console.log('Usuario:', id_usuario);
    console.log('Rol:', id_rol); // 1 = admin, 2 = cliente
    
    // Tu lógica aquí...
  }
};
```

---

## Recomendaciones de Seguridad

### ✅ Aplicar en Estados
- Crear, Modificar, Eliminar: **Solo Admin**
- Ver: **Usuarios autenticados**

### ✅ Aplicar en Paquetes  
- Crear, Modificar, Eliminar, Importar: **Solo Admin**
- Ver: **Usuarios autenticados**

### ✅ Aplicar en Grupos
- Crear, Modificar, Eliminar: **Solo Admin**
- Ver: **Usuarios autenticados**

### ✅ Aplicar en Casilleros
- Ver propio casillero: **Cliente autenticado**
- Ver todos los casilleros: **Solo Admin**

### ✅ Rutas Públicas (sin middleware)
- POST /api/crear-cuenta
- POST /api/login
