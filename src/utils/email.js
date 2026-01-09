import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración del transporter de nodemailer para Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Tu email de Gmail
    pass: process.env.EMAIL_PASS  // Contraseña de aplicación de Gmail
  }
});

export const emailService = {
  // Cargar plantilla HTML y reemplazar variables
  async cargarPlantilla(nombrePlantilla, variables) {
    const rutaPlantilla = path.join(__dirname, '../templates/emails', `${nombrePlantilla}.html`);
    let html = await fs.readFile(rutaPlantilla, 'utf-8');
    
    // Reemplazar todas las variables en el formato {{VARIABLE}}
    for (const [clave, valor] of Object.entries(variables)) {
      const regex = new RegExp(`{{${clave}}}`, 'g');
      html = html.replace(regex, valor);
    }
    
    return html;
  },

  // Enviar código de recuperación de contraseña
  async enviarCodigoRecuperacion(email, codigo, nombres) {
    // Cargar plantilla y reemplazar variables
    const html = await this.cargarPlantilla('recuperacion', {
      NOMBRES: nombres,
      CODIGO: codigo,
      YEAR: new Date().getFullYear()
    });

    const mailOptions = {
      from: `"Transportes Las Carolinas" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Código de Recuperación de Contraseña',
      html: html,
      attachments: [{
        filename: 'logo.png',
        path: path.join(__dirname, '../images/logo las carolinas.png'),
        cid: 'logo'
      }]
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error al enviar email:', error);
      throw new Error('No se pudo enviar el código de recuperación');
    }
  },

  // Enviar código de verificación de email
  async enviarCodigoVerificacion(email, codigo, nombres) {
    // Cargar plantilla y reemplazar variables
    const html = await this.cargarPlantilla('verificacion', {
      nombres: nombres,
      codigo: codigo
    });

    const mailOptions = {
      from: `"Transportes Las Carolinas" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Código de Verificación - Transportes Las Carolinas',
      html: html,
      attachments: [{
        filename: 'logo.png',
        path: path.join(__dirname, '../images/logo las carolinas.png'),
        cid: 'logo'
      }]
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error al enviar email de verificación:', error);
      throw new Error('No se pudo enviar el código de verificación');
    }
  },

  // Enviar correo de bienvenida al crear cuenta
  async enviarBienvenida(email, datosCliente) {
    const { nombres, apellidos, cod_casillero, tipo_entrega, ciudad } = datosCliente;
    const nombreCompleto = `${nombres} ${apellidos}`;
    const tipoEntregaTexto = tipo_entrega === 'domicilio' ? 'Entrega a Domicilio' : 'Retiro en Oficina';

    // Cargar plantilla y reemplazar variables
    const html = await this.cargarPlantilla('bienvenida', {
      NOMBRE_COMPLETO: nombreCompleto,
      COD_CASILLERO: cod_casillero,
      EMAIL: email,
      TIPO_ENTREGA: tipoEntregaTexto,
      CIUDAD: ciudad || 'No especificada',
      YEAR: new Date().getFullYear()
    });

    const mailOptions = {
      from: `"Transportes Las Carolinas" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 ¡Bienvenido a Transportes Las Carolinas!',
      html: html,
      attachments: [{
        filename: 'logo.png',
        path: path.join(__dirname, '../images/logo las carolinas.png'),
        cid: 'logo'
      }]
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error al enviar email de bienvenida:', error);
      throw new Error('No se pudo enviar el correo de bienvenida');
    }
  }
};
