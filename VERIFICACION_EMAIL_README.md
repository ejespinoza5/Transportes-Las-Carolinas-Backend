# Sistema de Verificación de Email

## 📋 Descripción

Este sistema implementa la verificación de correo electrónico para garantizar que los usuarios ingresen un email válido al registrarse. Esto previene problemas posteriores con la recuperación de contraseña.

## 🚀 Características

### 1. Validación de Formato de Email
- Verifica la sintaxis del correo electrónico
- Detecta errores comunes de tipeo (ej: gmial.com → gmail.com)
- Sugiere correcciones automáticas

### 2. Verificación por Código
- Envía un código de 6 dígitos al email del usuario
- Código válido por 15 minutos
- Sistema de reenvío de código

### 3. Control de Acceso
- Los usuarios deben verificar su email antes de poder usar todas las funcionalidades
- El email de bienvenida se envía solo después de verificar

## 📦 Instalación

### 1. Ejecutar Migración de Base de Datos

Ejecuta el archivo SQL para crear las tablas necesarias:

```bash
mysql -u tu_usuario -p tu_base_de_datos < migrations/add_email_verification.sql
```

O ejecuta manualmente las siguientes consultas:

```sql
-- Tabla para códigos de verificación
CREATE TABLE IF NOT EXISTS codigos_verificacion (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  codigo VARCHAR(6) NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  expira_en DATETIME NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_codigo (codigo),
  INDEX idx_expira (expira_en)
);

-- Añadir campo de verificación a usuarios
ALTER TABLE usuarios 
ADD COLUMN email_verificado BOOLEAN DEFAULT FALSE AFTER email;
```

### 2. Configurar Variables de Entorno

Asegúrate de tener configuradas las credenciales de email en tu archivo `.env`:

```env
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
```

## 🔧 Uso

### API Endpoints

#### 1. Crear Cuenta
```http
POST /api/crear-cuenta
Content-Type: application/json

{
  "email": "usuario@gmail.com",
  "password": "password123",
  "nombres": "Juan",
  "apellidos": "Pérez",
  "cedula": "1234567890",
  "celular": "0999999999",
  "ciudad": "Quito",
  "provincia": "Pichincha",
  "cod_postal": "170101",
  "tipo_entrega": "domicilio",
  "direccion_casa": "Calle Principal 123",
  "calle_secundaria": "Av. Secundaria",
  "referencia": "Casa azul"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Cuenta creada exitosamente. Por favor verifica tu correo electrónico.",
  "data": {
    "id_usuario": 1,
    "email": "usuario@gmail.com",
    "id_casillero": 1,
    "cod_casillero": "EC-0001",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "requiereVerificacion": true
  }
}
```

**Respuesta con error de formato:**
```json
{
  "success": false,
  "message": "El formato del email parece incorrecto. ¿Quisiste decir usuario@gmail.com?"
}
```

#### 2. Verificar Email
```http
POST /api/crear-cuenta/verificar-email
Content-Type: application/json

{
  "email": "usuario@gmail.com",
  "codigo": "123456"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Email verificado correctamente. ¡Bienvenido!",
  "emailVerificado": true
}
```

**Respuesta con código inválido:**
```json
{
  "success": false,
  "message": "Código de verificación inválido o expirado"
}
```

#### 3. Reenviar Código
```http
POST /api/crear-cuenta/reenviar-codigo
Content-Type: application/json

{
  "email": "usuario@gmail.com"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Código de verificación reenviado correctamente"
}
```

## 📧 Emails Enviados

### 1. Email de Verificación
Se envía al crear la cuenta con:
- Código de 6 dígitos
- Tiempo de expiración (15 minutos)
- Instrucciones de uso

### 2. Email de Bienvenida
Se envía automáticamente después de verificar el email con:
- Datos del casillero
- Información de la cuenta
- Instrucciones de uso del sistema

## 🔒 Seguridad

- Los códigos expiran en 15 minutos
- Cada código solo puede usarse una vez
- Se valida el formato del email antes de crear la cuenta
- Se detectan dominios mal escritos comunes

## 🛠️ Mantenimiento

### Limpiar Códigos Expirados

Para mantener la base de datos limpia, puedes ejecutar periódicamente:

```sql
DELETE FROM codigos_verificacion 
WHERE expira_en < NOW() OR usado = TRUE;
```

O crear un cron job que lo haga automáticamente.

## 📝 Validaciones Implementadas

### Formato de Email
- Estructura básica: `usuario@dominio.ext`
- No permite puntos al inicio o final del usuario
- Requiere al menos un punto en el dominio
- Detecta errores comunes:
  - `gmial.com` → `gmail.com`
  - `hotmai.com` → `hotmail.com`
  - `outluk.com` → `outlook.com`
  - etc.

### Códigos de Verificación
- 6 dígitos numéricos
- Únicos por email
- Expiración de 15 minutos
- Un solo uso

## 🎨 Frontend - Flujo Recomendado

1. **Registro:**
   - Usuario ingresa sus datos
   - Sistema valida el email
   - Si hay error de formato, muestra sugerencia
   - Crea la cuenta y muestra mensaje de verificación

2. **Verificación:**
   - Mostrar pantalla para ingresar código
   - Usuario ingresa código recibido por email
   - Opción para reenviar código
   - Al verificar, redirigir al login

3. **Login:**
   - Verificar que el email esté verificado
   - Si no está verificado, solicitar verificación

## 🐛 Troubleshooting

### El código no llega al email
1. Verificar configuración de `EMAIL_USER` y `EMAIL_PASS` en `.env`
2. Para Gmail, usar "Contraseña de aplicación" (no la contraseña normal)
3. Verificar que el email no esté en spam

### Error al crear la tabla
1. Verificar que tienes los permisos necesarios
2. Asegurarse de que la tabla `usuarios` existe
3. Verificar que el campo `email` existe en la tabla `usuarios`

### El código siempre expira
1. Verificar la zona horaria del servidor
2. Verificar la configuración de MySQL
3. Revisar que la hora del servidor sea correcta

## 📚 Archivos Modificados/Creados

- ✨ `src/utils/validaciones.js` - Utilidades de validación
- ✨ `src/templates/emails/verificacion.html` - Plantilla de email
- ✨ `migrations/add_email_verification.sql` - Migración de BD
- 📝 `src/services/crear_cuenta.service.js` - Actualizado
- 📝 `src/controllers/crear_cuenta.controller.js` - Actualizado
- 📝 `src/models/crear_cuenta.model.js` - Actualizado
- 📝 `src/routes/crear_cuenta.routes.js` - Actualizado
- 📝 `src/utils/email.js` - Actualizado
