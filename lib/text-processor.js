/**
 * Text Processor - Manejo de texto HTML y plain text
 * Extrae texto limpio, preserva estructura HTML, gestiona firmas
 */

class TextProcessor {
  /**
   * Detecta si el contenido es HTML
   * @param {string} content
   * @returns {boolean}
   */
  static isHtml(content) {
    return /<[a-z][\s\S]*>/i.test(content);
  }

  /**
   * Extrae texto plano de HTML para enviar a la IA
   * @param {string} html
   * @returns {string}
   */
  static htmlToPlainText(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Eliminar scripts y styles
    doc.querySelectorAll('script, style').forEach(el => el.remove());

    // Convertir <br> y bloques a saltos de linea
    doc.querySelectorAll('br').forEach(el => el.replaceWith('\n'));
    doc.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li, tr').forEach(el => {
      el.prepend(document.createTextNode('\n'));
    });

    return doc.body.textContent.replace(/\n{3,}/g, '\n\n').trim();
  }

  /**
   * Convierte texto plano (respuesta IA) a HTML basico
   * @param {string} text
   * @returns {string}
   */
  static plainTextToHtml(text) {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return escaped
      .split(/\n{2,}/)
      .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  /**
   * Separa el cuerpo del correo de la firma
   * Busca patrones comunes de firma: --, firma HTML, etc.
   * @param {string} content
   * @param {boolean} isHtml
   * @returns {{body: string, signature: string}}
   */
  static separateSignature(content, isHtml) {
    if (isHtml) {
      // Buscar firma en HTML: class="moz-signature" o <div class="signature">
      const sigPatterns = [
        /(<div[^>]*class="moz-signature"[^>]*>[\s\S]*$)/i,
        /(<div[^>]*class="signature"[^>]*>[\s\S]*$)/i,
        /(--\s*<br[\s/]*>[\s\S]*$)/i,
        /(<pre[^>]*class="moz-signature"[^>]*>[\s\S]*$)/i
      ];

      for (const pattern of sigPatterns) {
        const match = content.match(pattern);
        if (match) {
          const sigIndex = match.index;
          return {
            body: content.substring(0, sigIndex),
            signature: content.substring(sigIndex)
          };
        }
      }
    } else {
      // Texto plano: buscar "-- " al inicio de linea (RFC 3676)
      const sigMatch = content.match(/\n-- (\n|$)/);
      if (sigMatch) {
        return {
          body: content.substring(0, sigMatch.index),
          signature: content.substring(sigMatch.index)
        };
      }
    }

    return { body: content, signature: '' };
  }

  /**
   * Separa el texto citado (replied/forwarded) del cuerpo nuevo
   * @param {string} content
   * @param {boolean} isHtml
   * @returns {{newContent: string, quotedContent: string}}
   */
  static separateQuotedContent(content, isHtml) {
    if (isHtml) {
      // Thunderbird usa <blockquote type="cite"> para citados
      const quotePattern = /(<blockquote[^>]*type="cite"[^>]*>[\s\S]*$)/i;
      const match = content.match(quotePattern);
      if (match) {
        return {
          newContent: content.substring(0, match.index),
          quotedContent: content.substring(match.index)
        };
      }

      // Tambien buscar div.moz-cite-prefix
      const citePrefix = /(<div[^>]*class="moz-cite-prefix"[^>]*>[\s\S]*$)/i;
      const citeMatch = content.match(citePrefix);
      if (citeMatch) {
        return {
          newContent: content.substring(0, citeMatch.index),
          quotedContent: content.substring(citeMatch.index)
        };
      }
    } else {
      // Texto plano: lineas que empiezan con >
      const lines = content.split('\n');
      let quoteStart = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('>') || /^On\s+.+?\d{4}.+?wrote:\s*$/i.test(lines[i])) {
          quoteStart = i;
          break;
        }
      }
      if (quoteStart > 0) {
        return {
          newContent: lines.slice(0, quoteStart).join('\n'),
          quotedContent: lines.slice(quoteStart).join('\n')
        };
      }
    }

    return { newContent: content, quotedContent: '' };
  }

  /**
   * Procesa el contenido completo: separa cuerpo, firma y citado
   * Solo devuelve la parte editable (cuerpo nuevo sin firma ni citado)
   * @param {string} content
   * @returns {{editableText: string, prefix: string, suffix: string, isHtml: boolean}}
   */
  static extractEditable(content) {
    const isHtml = this.isHtml(content);

    // Primero separar firma
    const { body, signature } = this.separateSignature(content, isHtml);

    // Luego separar citado del cuerpo
    const { newContent, quotedContent } = this.separateQuotedContent(body, isHtml);

    // Extraer texto plano de la parte editable
    const editableText = isHtml ? this.htmlToPlainText(newContent) : newContent;

    return {
      editableText,
      suffix: (quotedContent || '') + (signature || ''),
      isHtml
    };
  }

  /**
   * Reconstruye el contenido completo con el texto mejorado
   * @param {string} improvedText - Texto mejorado por la IA (plano)
   * @param {string} suffix - Firma + citado original
   * @param {boolean} isHtml - Si el formato original era HTML
   * @returns {string}
   */
  static reconstruct(improvedText, suffix, isHtml) {
    if (isHtml) {
      const htmlBody = this.plainTextToHtml(improvedText);
      return htmlBody + suffix;
    }
    return improvedText + suffix;
  }
}
