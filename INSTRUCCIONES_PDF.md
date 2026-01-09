# Instalación de PDFKit

Para generar PDFs, necesitas instalar la librería PDFKit:

```bash
npm install pdfkit
```

## Uso del endpoint

Una vez instalado PDFKit, puedes generar el PDF de un paquete usando:

**Endpoint:**
```
GET /api/paquetes/estado/guia/{guia}/pdf
```

**Ejemplo:**
```
GET /api/paquetes/estado/guia/14041555/pdf
```

Esto descargará automáticamente un PDF con:
- Encabezado profesional con el logo de Transportes Las Carolinas
- Información completa del paquete (guía, servicio, courier, peso, etc.)
- Timeline del historial de estados con sus colores originales
- Diseño limpio y profesional siguiendo el estilo de tus templates de email

## Características del PDF:

✅ Header con fondo #E8F0FE (color de tus templates)
✅ Logo de Transportes Las Carolinas
✅ Guía destacada en caja resaltada
✅ Información del paquete en dos columnas
✅ Timeline vertical de estados con círculos de colores
✅ Estados ordenados por fecha (más reciente primero)
✅ Formato profesional A4
✅ Pie de página con información de la empresa

El PDF se descargará automáticamente con el nombre: `guia-{numero}.pdf`
