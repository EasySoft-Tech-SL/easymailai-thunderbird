/**
 * EasyMailAI - i18n Helper
 * Resuelve atributos data-i18n en el DOM
 * Uso: añadir data-i18n="key" a elementos para textContent
 *      data-i18n-placeholder="key" para placeholder
 *      data-i18n-title="key" para title
 */

function applyI18n(root) {
  const doc = root || document;

  // textContent
  doc.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const msg = browser.i18n.getMessage(key);
    if (msg) el.textContent = msg;
  });

  // placeholder
  doc.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const msg = browser.i18n.getMessage(key);
    if (msg) el.placeholder = msg;
  });

  // title
  doc.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const msg = browser.i18n.getMessage(key);
    if (msg) el.title = msg;
  });
}

/**
 * Shortcut para obtener un mensaje i18n
 */
function msg(key, ...substitutions) {
  return browser.i18n.getMessage(key, substitutions) || key;
}
