import PDFDocument from "pdfkit"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const generarPDFPaquete = (paquete, historial, res) => {
  try {
    const doc = new PDFDocument({ margin: 40, size: "A4" })

    // Configurar headers para descarga
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=guia-${paquete.Guia}.pdf`)

    // Pipe al response
    doc.pipe(res)

    // Manejar errores del stream
  const docErrorHandler = (err) => {
    console.error('Error en PDF:', err)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error al generar PDF' })
    }
  };
  
  const resErrorHandler = (err) => {
    console.error('Error en response:', err)
  };
  
  doc.on('error', docErrorHandler);
  res.on('error', resErrorHandler);
  
  // Limpiar listeners cuando termine
  doc.on('end', () => {
    doc.removeListener('error', docErrorHandler);
    res.removeListener('error', resErrorHandler);
  });

  const colores = {
    // Colores principales (manteniendo la identidad)
    azulOscuro: "#0A2A66", // Azul marino corporativo
    azulMedio: "#1E56A0", // Azul intermedio para variedad
    azulClaro: "#E8F0FE", // Azul pastel para fondos
    azulAcento: "#2E7DD6", // Azul brillante para destacar
    azulGrisaceo: "#546E7A", // Gris azulado

    // Neutrales
    grisOscuro: "#2C3E50", // Gris oscuro para texto principal
    grisMedio: "#566573", // Gris medio para texto secundario
    grisClaro: "#ECF0F1", // Gris claro para separadores
    blanco: "#FFFFFF",

    // Estados (para historial)
    exito: "#27AE60",
    advertencia: "#F39C12",
    info: "#3498DB",
    neutral: "#95A5A6",
  }

  // === ENCABEZADO PROFESIONAL ===

  // Fondo principal del header (azul oscuro)
  doc.rect(0, 0, doc.page.width, 120).fill(colores.azulOscuro)

  // Línea decorativa inferior sutil (blanca con opacidad)
  doc
    .rect(0, 117, doc.page.width, 3)
    .fillOpacity(0.2)
    .fill(colores.blanco)
  doc.fillOpacity(1)

  // Patrón decorativo mejorado - círculos en cascada
  for (let i = 0; i < 6; i++) {
    doc
      .circle(doc.page.width - 40 - i * 25, 25 + i * 12, 10 - i * 1)
      .fillOpacity(0.12)
      .fill(colores.blanco)
  }
  
  // Círculos adicionales en la parte inferior derecha
  for (let i = 0; i < 4; i++) {
    doc
      .circle(doc.page.width - 50 - i * 30, 95 - i * 8, 6)
      .fillOpacity(0.08)
      .fill(colores.azulClaro)
  }
  
  doc.fillOpacity(1)

  // Logo (si existe)
  const logoPath = path.join(__dirname, "../images/logo las carolinas.png")
  if (fs.existsSync(logoPath)) {
    try {
      // Fondo blanco circular para el logo centrado verticalmente
      doc.circle(100, 60, 40).fill(colores.blanco)

      // Centrar logo dentro del circulo (circulo en 100,60 con radio 40)
      // Logo de 60px, centrado = 100 - 30 = 70, 60 - 30 = 30
      doc.image(logoPath, 70, 30, { width: 60, height: 60 })
    } catch (error) {
      console.error("Error al cargar logo:", error)
    }
  }

  // Contenedor de información del header
  const headerTextX = 170

  doc.fillColor(colores.blanco).fontSize(24).font("Helvetica-Bold").text("REPORTE DE ENVIO", headerTextX, 30)

  doc
    .moveTo(headerTextX, 57)
    .lineTo(headerTextX + 200, 57)
    .strokeColor(colores.blanco)
    .strokeOpacity(0.3)
    .lineWidth(1)
    .stroke()
  
  doc.strokeOpacity(1)

  doc.fillColor(colores.azulClaro).fontSize(12).font("Helvetica").text("Transportes Las Carolinas", headerTextX, 67)

  const fechaActual = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  doc
    .fillColor(colores.grisClaro)
    .fontSize(9)
    .font("Helvetica")
    .text(`Fecha de generación: ${fechaActual}`, headerTextX, 88)

  const guiaBoxWidth = 130
  const guiaBoxHeight = 45
  const guiaBoxX = doc.page.width - 50 - guiaBoxWidth
  const guiaBoxY = 38

  doc.roundedRect(guiaBoxX, guiaBoxY, guiaBoxWidth, guiaBoxHeight, 8).fill(colores.azulMedio)

  doc
    .fillColor(colores.blanco)
    .fontSize(8)
    .font("Helvetica-Bold")
    .text("GUIA N°", guiaBoxX, guiaBoxY + 10, { width: guiaBoxWidth, align: "center" })

  doc.fontSize(16).text(paquete.Guia, guiaBoxX, guiaBoxY + 23, { width: guiaBoxWidth, align: "center" })

  // === INFORMACIÓN DEL PAQUETE ===
  let yPos = 145

  doc.fillColor(colores.azulOscuro).fontSize(14).font("Helvetica-Bold").text("INFORMACIÓN DEL PAQUETE", 40, yPos)

  doc
    .moveTo(40, yPos + 18)
    .lineTo(140, yPos + 18)
    .strokeColor(colores.azulAcento)
    .lineWidth(3)
    .stroke()

  yPos += 32

  // Obtener el estado más reciente del historial
  const estadosRecientes = [...historial].sort((a, b) => {
    const fechaA = new Date(`${a.fecha_cambio} ${a.hora_cambio}`)
    const fechaB = new Date(`${b.fecha_cambio} ${b.hora_cambio}`)
    return fechaA - fechaB // Ordenar ascendente
  })
  const estadoActual = estadosRecientes[estadosRecientes.length - 1]?.estado || "N/A"

  const datos = [
    { label: "Estado Actual", value: estadoActual, icono: ">" },
    { label: "Servicio", value: paquete.Servicio, icono: ">" },
    { label: "Courier", value: paquete.Courier, icono: ">" },
    { label: "Peso", value: `${paquete.Peso_LB} lb`, icono: ">" },
    {
      label: "Fecha Salida",
      value: paquete.Fecha_Salida ? new Date(paquete.Fecha_Salida).toLocaleDateString("es-ES") : "N/A",
      icono: ">",
    },
    { label: "Guia Tramaco", value: paquete.guia_tramaco || "N/A", icono: ">" },
  ]

  const colWidth = (doc.page.width - 100) / 2
  const cardHeight = 36
  let col = 0
  let row = 0

  datos.forEach((dato, index) => {
    const x = 40 + col * (colWidth + 20)
    const y = yPos + row * (cardHeight + 8)

    doc
      .roundedRect(x + 2, y + 2, colWidth, cardHeight, 6)
      .fillOpacity(0.1)
      .fill(colores.grisOscuro)

    doc.fillOpacity(1)

    doc.roundedRect(x, y, colWidth, cardHeight, 6).fill(colores.blanco).stroke(colores.grisClaro)

    doc
      .fillColor(colores.azulMedio)
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(dato.icono, x + 10, y + 12)

    doc
      .fillColor(colores.grisMedio)
      .fontSize(7)
      .font("Helvetica")
      .text(dato.label, x + 30, y + 8, { width: colWidth - 40 })

    doc
      .fillColor(colores.grisOscuro)
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(dato.value, x + 30, y + 20, { width: colWidth - 40 })

    col++
    if (col === 2) {
      col = 0
      row++
    }
  })

  yPos += Math.ceil(datos.length / 2) * (cardHeight + 8) + 20

  // === HISTORIAL DE ESTADOS ===
  doc.fillColor(colores.azulOscuro).fontSize(14).font("Helvetica-Bold").text("HISTORIAL DE ESTADOS", 40, yPos)

  doc
    .moveTo(40, yPos + 18)
    .lineTo(140, yPos + 18)
    .strokeColor(colores.azulAcento)
    .lineWidth(3)
    .stroke()

  yPos += 28

  const historialOrdenado = [...historial].sort((a, b) => {
    const fechaA = new Date(`${a.fecha_cambio} ${a.hora_cambio}`)
    const fechaB = new Date(`${b.fecha_cambio} ${b.hora_cambio}`)
    return fechaA - fechaB
  })

  historialOrdenado.forEach((estado, index) => {
    // Reservar espacio para el footer (60px del final)
    if (yPos > doc.page.height - 100) {
      doc.addPage()
      yPos = 50
    }

    const colorEstado = estado.color || colores.info
    const isLast = index === historialOrdenado.length - 1

    if (isLast) {
      doc
        .circle(60, yPos + 14, 11)
        .fillOpacity(0.2)
        .fill(colorEstado)
      doc.fillOpacity(1)
    }

    doc
      .circle(60, yPos + 14, 8)
      .fill(colores.blanco)
      .stroke(colorEstado)

    doc.circle(60, yPos + 14, 5).fill(colorEstado)

    if (index < historialOrdenado.length - 1) {
      doc
        .moveTo(60, yPos + 22)
        .lineTo(60, yPos + 50)
        .strokeColor(colores.grisClaro)
        .lineWidth(2)
        .stroke()
    }

    const boxWidth = doc.page.width - 130

    doc
      .roundedRect(87, yPos + 2, boxWidth, 42, 6)
      .fillOpacity(0.05)
      .fill(colores.grisOscuro)

    doc.fillOpacity(1)

    doc
      .roundedRect(85, yPos, boxWidth, 42, 6)
      .fill(isLast ? colores.azulClaro : colores.blanco)
      .strokeColor(isLast ? colores.azulMedio : colores.grisClaro)
      .lineWidth(isLast ? 2 : 1)
      .stroke()

    doc.roundedRect(85, yPos, 5, 42, 3).fill(colorEstado)

    doc
      .fillColor(colores.grisOscuro)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(estado.estado, 105, yPos + 6, { width: boxWidth - 180 })

    // Formatear fecha directamente sin conversión de zona horaria
    let fechaFormateada = '';
    if (estado.fecha_cambio) {
      if (typeof estado.fecha_cambio === 'string') {
        const [year, month, day] = estado.fecha_cambio.split('-');
        fechaFormateada = `${day}/${month}/${year}`;
      } else if (estado.fecha_cambio instanceof Date) {
        const day = String(estado.fecha_cambio.getDate()).padStart(2, '0');
        const month = String(estado.fecha_cambio.getMonth() + 1).padStart(2, '0');
        const year = estado.fecha_cambio.getFullYear();
        fechaFormateada = `${day}/${month}/${year}`;
      }
    }
    
    doc
      .fillColor(colores.grisMedio)
      .fontSize(8)
      .font("Helvetica")
      .text(`${fechaFormateada} - ${estado.hora_cambio || ''}`, 105, yPos + 20)

    if (isLast) {
      const badgeX = boxWidth - 90
      doc.roundedRect(badgeX, yPos + 5, 75, 14, 6).fill(colores.azulMedio)

      doc
        .fillColor(colores.blanco)
        .fontSize(6)
        .font("Helvetica-Bold")
        .text("MAS RECIENTE", badgeX, yPos + 8, { width: 75, align: "center" })
    }

    if (estado.observaciones) {
      doc
        .fillColor(colores.grisMedio)
        .fontSize(7)
        .font("Helvetica-Oblique")
        .text(`${estado.observaciones}`, 105, yPos + 30, {
          width: boxWidth - 120,
        })
    }

    yPos += 50
  })

  // === FOOTER EN TODAS LAS PÁGINAS ===
  const pageCount = doc.bufferedPageRange().count
  
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i)
    
    const footerY = doc.page.height - 60
    
    doc
      .moveTo(40, footerY)
      .lineTo(doc.page.width - 40, footerY)
      .strokeColor(colores.grisClaro)
      .lineWidth(1)
      .stroke()

    doc
      .fontSize(7)
      .fillColor(colores.grisMedio)
      .font("Helvetica")
      .text(
        `Transportes Las Carolinas | ${fechaActual} | Página ${i + 1} de ${pageCount}`,
        40,
        footerY + 8,
        { width: doc.page.width - 80, align: "center" }
      )
  }

  // Finalizar documento
  doc.end()
  } catch (error) {
    console.error('Error generando PDF:', error)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error al generar PDF' })
    }
  }
}
