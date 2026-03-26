/**
 * EasyMailAI - Autocomplete (Ghost Text)
 * Se inyecta en el compositor via compose_scripts
 * Muestra sugerencias de texto gris mientras el usuario escribe
 * Solo funciona en modo HTML (contentEditable), no en texto plano
 *
 * Desarrollado por Easysoft Tech S.L. (https://easysoft.es)
 */

(function () {
  'use strict';

  // --- Defaults (leidos de storage en loadConfig, estos son solo fallback) ---
  const FALLBACK_DEBOUNCE_MS = 2000;
  const MIN_TEXT_LENGTH = 10;
  const MAX_CONTEXT_LENGTH = 500;

  // --- Estado ---
  let isEnabled = false;
  let debounceTimer = null;
  let ghostNode = null;
  let hintNode = null;
  let currentSuggestion = '';
  let isRequesting = false;
  let debounceMs = FALLBACK_DEBOUNCE_MS;
  let abortController = null;

  // --- Configuracion ---

  async function loadConfig() {
    try {
      const result = await browser.storage.local.get('featureConfig');
      const config = result.featureConfig || {};
      isEnabled = config.autocomplete !== false;
      debounceMs = parseInt(config.autocompleteDelay) || FALLBACK_DEBOUNCE_MS;
    } catch (_) {
      isEnabled = true;
    }
  }

  browser.storage.onChanged.addListener((changes) => {
    if (changes.featureConfig) {
      const config = changes.featureConfig.newValue || {};
      isEnabled = config.autocomplete !== false;
      debounceMs = parseInt(config.autocompleteDelay) || FALLBACK_DEBOUNCE_MS;

      if (!isEnabled) {
        removeGhost();
        removeHint();
        clearTimeout(debounceTimer);
        if (abortController) {
          abortController.abort();
          abortController = null;
        }
      }
    }
  });

  // --- Ghost Text DOM ---

  function ensureHint() {
    if (hintNode && hintNode.parentNode) return;
    hintNode = document.createElement('div');
    hintNode.className = 'easymailai-ghost-hint';
    hintNode.textContent = browser.i18n.getMessage('autocomplete_hint') || 'Tab \u2192 accept | Esc \u2192 dismiss';
    document.body.appendChild(hintNode);
  }

  function removeHint() {
    if (hintNode && hintNode.parentNode) {
      hintNode.parentNode.removeChild(hintNode);
    }
    hintNode = null;
  }

  function showGhost(text) {
    removeGhost();
    if (!text) return;

    currentSuggestion = text;

    const selection = document.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0).cloneRange();

    // Verificar que el rango es valido en el DOM actual
    try {
      if (!document.contains(range.startContainer)) return;
    } catch (_) {
      return;
    }

    ghostNode = document.createElement('span');
    ghostNode.className = 'easymailai-ghost';
    ghostNode.setAttribute('contenteditable', 'false');
    ghostNode.setAttribute('data-easymailai', 'ghost');
    ghostNode.textContent = text;

    try {
      range.collapse(false);
      range.insertNode(ghostNode);

      range.setStartBefore(ghostNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (_) {
      // Si falla la insercion, limpiar
      if (ghostNode.parentNode) {
        ghostNode.parentNode.removeChild(ghostNode);
      }
      ghostNode = null;
      currentSuggestion = '';
      return;
    }

    ensureHint();
    hintNode.classList.add('visible');
  }

  function removeGhost() {
    if (ghostNode) {
      try {
        if (ghostNode.parentNode) {
          ghostNode.parentNode.removeChild(ghostNode);
        }
      } catch (_) {
        // Forzar limpieza si removeChild falla
        try {
          ghostNode.outerHTML = '';
        } catch (_) {}
      }
    }
    ghostNode = null;
    currentSuggestion = '';

    if (hintNode) {
      hintNode.classList.remove('visible');
    }
  }

  function acceptGhost() {
    if (!ghostNode || !currentSuggestion) return false;

    const text = currentSuggestion;
    const parent = ghostNode.parentNode;

    if (!parent || !parent.contains(ghostNode)) {
      ghostNode = null;
      currentSuggestion = '';
      return false;
    }

    const nextSibling = ghostNode.nextSibling;

    try {
      parent.removeChild(ghostNode);
    } catch (_) {
      ghostNode = null;
      currentSuggestion = '';
      return false;
    }
    ghostNode = null;

    const textNode = document.createTextNode(text);
    try {
      if (nextSibling && nextSibling.parentNode === parent) {
        parent.insertBefore(textNode, nextSibling);
      } else {
        parent.appendChild(textNode);
      }
    } catch (_) {
      currentSuggestion = '';
      return false;
    }

    try {
      const selection = document.getSelection();
      const range = document.createRange();
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (_) {}

    currentSuggestion = '';
    if (hintNode) hintNode.classList.remove('visible');

    return true;
  }

  // --- Extraccion de texto ---

  function getEditorText() {
    const ghosts = document.querySelectorAll('[data-easymailai="ghost"]');
    const savedDisplay = [];

    ghosts.forEach((g, i) => {
      savedDisplay[i] = g.style.display;
      g.style.display = 'none';
    });

    let text = '';
    try {
      const editable = document.body.querySelector('[contenteditable]');
      text = (editable || document.body).innerText || '';
    } finally {
      ghosts.forEach((g, i) => {
        g.style.display = savedDisplay[i] || '';
      });
    }

    const trimmed = text.trim();
    if (trimmed.length > MAX_CONTEXT_LENGTH) {
      return trimmed.substring(trimmed.length - MAX_CONTEXT_LENGTH);
    }
    return trimmed;
  }

  // --- API ---

  async function requestSuggestion(text) {
    if (isRequesting) return;
    if (!text || text.length < MIN_TEXT_LENGTH) return;

    isRequesting = true;

    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();
    const signal = abortController.signal;

    try {
      if (signal.aborted) {
        isRequesting = false;
        return;
      }

      const response = await browser.runtime.sendMessage({
        action: 'autocomplete',
        text: text
      });

      // Verificar que no se aborto durante la espera
      if (signal.aborted) {
        isRequesting = false;
        return;
      }

      if (response?.success && response.suggestion) {
        showGhost(response.suggestion);
      }
    } catch (_) {
      // Silenciar errores (usuario sigue escribiendo)
    } finally {
      isRequesting = false;
    }
  }

  // --- Event Handlers ---

  function onInput() {
    if (!isEnabled) return;

    removeGhost();

    if (abortController) {
      abortController.abort();
      abortController = null;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const text = getEditorText();
      if (text) {
        requestSuggestion(text);
      }
    }, debounceMs);
  }

  function onKeyDown(e) {
    if (!isEnabled) return;

    if (currentSuggestion && ghostNode) {
      if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        acceptGhost();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        removeGhost();
        return;
      }

      if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Enter') {
        removeGhost();
      }
    }
  }

  // --- Listener para seleccion (usado por el popup para feature "actuar sobre seleccion") ---

  browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'getSelection') {
      const selection = document.getSelection();
      const selectedText = selection ? selection.toString().trim() : '';
      return Promise.resolve({ selectedText });
    }
  });

  // --- Inicializacion ---

  async function init() {
    await loadConfig();

    document.addEventListener('input', onInput, true);
    document.addEventListener('keydown', onKeyDown, true);

    document.addEventListener('blur', () => {
      clearTimeout(debounceTimer);
      removeGhost();
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
