/**
 * Validaciones de formato para campos de entrada
 */

export const validaciones = {
  /**
   * Valida que el email tenga un formato válido
   * @param {string} email - Email a validar
   * @returns {boolean} - true si es válido, false si no
   */
  esEmailValido(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }

    // Expresión regular para validar email
    const regexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    
    // Validar formato básico
    if (!regexEmail.test(email)) {
      return false;
    }

    // Validaciones adicionales
    const partes = email.split('@');
    if (partes.length !== 2) {
      return false;
    }

    const [usuario, dominio] = partes;

    // Validar que el usuario no esté vacío y no termine en punto
    if (!usuario || usuario.endsWith('.') || usuario.startsWith('.')) {
      return false;
    }

    // Validar que el dominio tenga al menos un punto
    if (!dominio.includes('.')) {
      return false;
    }

    // Validar dominios comunes mal escritos
    const dominiosValidos = [
      'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 
      'icloud.com', 'live.com', 'msn.com', 'aol.com',
      'mail.com', 'protonmail.com', 'zoho.com'
    ];

    const dominiosComunes = [
      'gmail', 'hotmail', 'outlook', 'yahoo', 'icloud', 
      'live', 'msn', 'aol', 'mail', 'protonmail', 'zoho'
    ];

    // Si el dominio es parecido a uno común pero mal escrito, sugerir corrección
    const dominioLower = dominio.toLowerCase();
    for (let dominioComun of dominiosComunes) {
      if (dominioLower.includes(dominioComun) && !dominiosValidos.includes(dominioLower)) {
        // Podría ser un error de tipeo
        console.warn(`Posible error en dominio: ${dominio}. ¿Quiso decir ${dominioComun}.com?`);
      }
    }

    return true;
  },

  /**
   * Sugiere correcciones para emails mal escritos
   * @param {string} email - Email a analizar
   * @returns {string|null} - Sugerencia de corrección o null
   */
  sugerirCorreccionEmail(email) {
    if (!email || typeof email !== 'string') {
      return null;
    }

    const dominiosCorrectos = {
      'gmail.com': ['gmial.com', 'gmai.com', 'gmail.co', 'gnail.com', 'gmaul.com'],
      'hotmail.com': ['hotmial.com', 'hotmai.com', 'hotmail.co', 'hotnail.com'],
      'outlook.com': ['outlok.com', 'outlook.co', 'outluk.com'],
      'yahoo.com': ['yahou.com', 'yahoo.co', 'yaho.com'],
      'icloud.com': ['iclud.com', 'icloud.co', 'iclou.com']
    };

    const partes = email.split('@');
    if (partes.length !== 2) {
      return null;
    }

    const [usuario, dominio] = partes;
    const dominioLower = dominio.toLowerCase();

    // Buscar si el dominio es un error común
    for (let [correcto, errores] of Object.entries(dominiosCorrectos)) {
      if (errores.includes(dominioLower)) {
        return `${usuario}@${correcto}`;
      }
    }

    return null;
  },

  /**
   * Genera un código de verificación de 6 dígitos
   * @returns {string} - Código de 6 dígitos
   */
  generarCodigoVerificacion() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
};
