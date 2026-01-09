# Ejemplos de Pruebas - API de Verificación de Email

## 🧪 Pruebas con POSTMAN o cURL

### 1. Crear Cuenta (Con Email Válido)

```bash
curl -X POST http://localhost:3000/api/crear-cuenta \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "password": "Password123",
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
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Cuenta creada exitosamente. Por favor verifica tu correo electrónico.",
  "data": {
    "id_usuario": 1,
    "email": "test@gmail.com",
    "id_casillero": 1,
    "cod_casillero": "EC-0001",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "requiereVerificacion": true
  }
}
```

---

### 2. Crear Cuenta (Con Email Mal Escrito)

```bash
curl -X POST http://localhost:3000/api/crear-cuenta \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmial.com",
    "password": "Password123",
    "nombres": "María",
    "apellidos": "García",
    "cedula": "0987654321",
    "celular": "0999999999",
    "ciudad": "Guayaquil",
    "provincia": "Guayas",
    "cod_postal": "090101",
    "tipo_entrega": "oficina"
  }'
```

**Respuesta esperada:**
```json
{
  "success": false,
  "message": "El formato del email parece incorrecto. ¿Quisiste decir test@gmail.com?"
}
```

---

### 3. Verificar Email

```bash
curl -X POST http://localhost:3000/api/crear-cuenta/verificar-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "codigo": "123456"
  }'
```

**Respuesta esperada (éxito):**
```json
{
  "success": true,
  "message": "Email verificado correctamente. ¡Bienvenido!",
  "emailVerificado": true
}
```

**Respuesta esperada (código inválido):**
```json
{
  "success": false,
  "message": "Código de verificación inválido o expirado"
}
```

---

### 4. Reenviar Código de Verificación

```bash
curl -X POST http://localhost:3000/api/crear-cuenta/reenviar-codigo \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Código de verificación reenviado correctamente"
}
```

---

### 5. Intentar Login Sin Verificar Email

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "password": "Password123"
  }'
```

**Respuesta esperada (email no verificado):**
```json
{
  "success": false,
  "message": "Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.",
  "emailNoVerificado": true
}
```

---

### 6. Login Después de Verificar Email

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "password": "Password123"
  }'
```

**Respuesta esperada (éxito):**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id_usuario": 1,
    "email": "test@gmail.com",
    "id_rol": 2
  }
}
```

---

## 🔍 Casos de Prueba Adicionales

### Email con Formato Inválido

```bash
# Sin @
curl -X POST http://localhost:3000/api/crear-cuenta \
  -H "Content-Type: application/json" \
  -d '{"email": "testgmail.com", ...}'

# Sin dominio
curl -X POST http://localhost:3000/api/crear-cuenta \
  -H "Content-Type: application/json" \
  -d '{"email": "test@", ...}'

# Punto al final del usuario
curl -X POST http://localhost:3000/api/crear-cuenta \
  -H "Content-Type: application/json" \
  -d '{"email": "test.@gmail.com", ...}'
```

**Respuesta esperada:**
```json
{
  "success": false,
  "message": "El formato del email no es válido. Verifica que esté escrito correctamente."
}
```

---

### Código Expirado (después de 15 minutos)

```bash
# Esperar más de 15 minutos después de crear la cuenta
curl -X POST http://localhost:3000/api/crear-cuenta/verificar-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "codigo": "123456"
  }'
```

**Respuesta esperada:**
```json
{
  "success": false,
  "message": "Código de verificación inválido o expirado"
}
```

---

## 📊 Verificar en la Base de Datos

### Ver códigos de verificación

```sql
SELECT * FROM codigos_verificacion 
WHERE email = 'test@gmail.com' 
ORDER BY creado_en DESC;
```

### Verificar estado de verificación del usuario

```sql
SELECT email, email_verificado, estado 
FROM usuarios 
WHERE email = 'test@gmail.com';
```

### Ver códigos expirados

```sql
SELECT * FROM codigos_verificacion 
WHERE expira_en < NOW();
```

### Limpiar códigos viejos

```sql
DELETE FROM codigos_verificacion 
WHERE expira_en < NOW() OR usado = TRUE;
```

---

## 🎯 Flujo Completo de Prueba

1. **Crear cuenta** → Recibir mensaje de verificación
2. **Revisar email** → Obtener código de 6 dígitos
3. **Verificar email** → Ingresar código
4. **Login exitoso** → Obtener token
5. **Usar sistema** → Acceder a todas las funcionalidades

---

## 🐛 Solución de Problemas

### No llega el email
1. Verificar `.env` con credenciales correctas
2. Revisar carpeta de spam
3. Verificar logs del servidor: `console.log` mostrará errores de email

### Código siempre inválido
1. Verificar que el código sea el correcto (copiar/pegar)
2. Verificar que no hayan pasado 15 minutos
3. Revisar en BD si el código existe y no está usado

### Error al crear tablas
1. Ejecutar migración SQL manualmente
2. Verificar permisos de base de datos
3. Verificar que tabla `usuarios` ya existe
