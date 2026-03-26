/**
 * EasyMailAI - i18n Helper
 * Resuelve atributos data-i18n en el DOM
 * Compatible con Thunderbird options_ui iframe context
 */

function applyI18n(root) {
  const doc = root || document;

  // textContent (incluyendo option elements)
  doc.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    const translated = browser.i18n.getMessage(key);
    if (translated) {
      if (el.tagName === 'OPTION') {
        el.textContent = translated;
        // Preservar el label del option si existe
        if (!el.label || el.label === el.textContent) {
          el.label = translated;
        }
      } else {
        el.textContent = translated;
      }
    }
  });

  // placeholder
  doc.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (!key) return;
    const translated = browser.i18n.getMessage(key);
    if (translated) el.placeholder = translated;
  });

  // title
  doc.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (!key) return;
    const translated = browser.i18n.getMessage(key);
    if (translated) el.title = translated;
  });
}

/**
 * Shortcut para obtener un mensaje i18n
 */
function msg(key, ...substitutions) {
  return browser.i18n.getMessage(key, substitutions) || key;
}

/**
 * Aplica i18n cuando el DOM este listo
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => applyI18n());
} else {
  // DOM ya cargado, aplicar inmediatamente
  applyI18n();
}
