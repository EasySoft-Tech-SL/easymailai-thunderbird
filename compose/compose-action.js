/**
 * EasyMailAI - Compose Action Popup
 * Selector rapido de acciones, tono, longitud, traduccion
 */

// Referencias a vistas
const views = {
  initial: document.getElementById('view-initial'),
  loading: document.getElementById('view-loading'),
  preview: document.getElementById('view-preview'),
  applied: document.getElementById('view-applied'),
  error: document.getElementById('view-error'),
  reply: document.getElementById('view-reply'),
  subject: document.getElementById('view-subject'),
  analysis: document.getElementById('view-analysis'),
  recipient: document.getElementById('view-recipient'),
  snippets: document.getElementById('view-snippets')
};

// Estado local
let currentTabId = null;
let isReady = false;
let isProcessing = false;
let improvedText = '';
let originalText = '';
let lastActionId = 'improve';
let requestId = 0;

// --- Utilidades ---

function showView(viewName) {
  Object.values(views).forEach(v => v.classList.add('hidden'));
  views[viewName].classList.remove('hidden');
}

async function getCurrentTabId() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  return tabs[0]?.id;
}

async function sendMessage(action, data = {}) {
  return browser.runtime.sendMessage({ action, tabId: currentTabId, ...data });
}

function showError(message) {
  document.getElementById('error-text').textContent = message;
  showView('error');
}

// --- Opciones avanzadas ---

function getSelectedTone() {
  return document.getElementById('sel-tone').value;
}

function getSelectedLength() {
  const active = document.querySelector('.len-btn.active');
  return active ? active.dataset.len : 'same';
}

function getSelectedTranslation() {
  return document.getElementById('sel-translate').value;
}

/**
 * Construye instrucciones adicionales basadas en opciones avanzadas
 */
function buildExtraInstructions() {
  const parts = [];

  const tone = getSelectedTone();
  if (tone) {
    // Instrucciones para la IA - siempre en ingles para consistencia con modelos
    parts.push(`Use a ${tone} tone.`);
  }

  const length = getSelectedLength();
  if (length === 'shorter') {
    parts.push('Make the text significantly shorter, keep only the essentials.');
  } else if (length === 'longer') {
    parts.push('Expand and develop the text to make it more complete and detailed.');
  }

  const lang = getSelectedTranslation();
  if (lang) {
    const langName = LANGUAGE_NAMES[lang] || lang;
    parts.push(`Translate the result to ${langName}. The final text must be entirely in ${langName}.`);
  }

  return parts.join('\n');
}

// --- Acciones principales ---

/**
 * Inicia el proceso con un prompt especifico
 */
async function startAction(actionId) {
  if (!isReady) {
    showError(msg('error_loading_retry'));
    return;
  }

  if (isProcessing) {
    return; // Evitar clicks rapidos duplicados
  }

  isProcessing = true;
  lastActionId = actionId;
  const currentRequestId = ++requestId;

  // Texto de carga segun accion (i18n)
  const loadingKeys = {
    improve: 'loading_improving', formalize: 'loading_formalizing',
    simplify: 'loading_simplifying', shorten: 'loading_shortening',
    expand: 'loading_expanding', grammar: 'loading_grammar',
    friendly: 'loading_tone', diplomatic: 'loading_tone',
    complete: 'loading_completing', suggest_next: 'loading_suggesting',
    bilingual: 'loading_improving', from_transcription: 'loading_improving',
    from_bullets: 'loading_improving'
  };

  document.getElementById('loading-text').textContent =
    msg(loadingKeys[actionId] || 'status_processing');
  showView('loading');

  try {
    const extraInstructions = buildExtraInstructions();

    // Intentar obtener texto seleccionado del compositor
    let selectedText = '';
    try {
      const selResult = await browser.tabs.sendMessage(currentTabId, { action: 'getSelection' });
      if (selResult?.selectedText) selectedText = selResult.selectedText;
    } catch (_) {}

    const result = await sendMessage('improve', {
      profileId: actionId,
      extraInstructions,
      selectedText
    });

    if (!document.body || currentRequestId !== requestId) return;

    isProcessing = false;

    if (result.success) {
      originalText = result.original;
      improvedText = result.improved;

      document.getElementById('tab-improved').textContent = improvedText;
      document.getElementById('tab-original').textContent = originalText;

      // Reset tabs
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelector('[data-tab="improved"]').classList.add('active');
      document.getElementById('tab-improved').classList.remove('hidden');
      document.getElementById('tab-original').classList.add('hidden');

      showView('preview');
    } else {
      showError(result.error);
    }
  } catch (error) {
    isProcessing = false;
    if (!document.body || currentRequestId !== requestId) return;
    showError(msg('error_communication', error.message));
  }
}

async function applyImproved() {
  try {
    const result = await sendMessage('applyImproved', { improvedText });
    if (result.success) {
      showView('applied');
    } else {
      showError(result.error);
    }
  } catch (error) {
    showError(msg('error_applying', error.message));
  }
}

async function undoImprove() {
  try {
    const result = await sendMessage('undo');
    if (result.success) {
      showView('initial');
    } else {
      showError(result.error);
    }
  } catch (error) {
    showError(msg('error_undoing', error.message));
  }
}

// --- Renderizar acciones rapidas ---

async function renderQuickActions() {
  const container = document.getElementById('quick-actions');

  // Cargar config de features
  let featureConfig = {};
  try {
    const stored = await browser.storage.local.get('featureConfig');
    featureConfig = stored.featureConfig || {};
  } catch (_) {}

  const actions = [
    { id: 'improve', icon: '✨', i18nKey: 'action_improve', primary: true },
    { id: 'formalize', icon: '👔', i18nKey: 'action_formalize' },
    { id: 'simplify', icon: '💡', i18nKey: 'action_simplify' },
    { id: 'shorten', icon: '✂️', i18nKey: 'action_shorten' },
    { id: 'expand', icon: '📝', i18nKey: 'action_expand' },
    { id: 'grammar', icon: '📖', i18nKey: 'action_grammar' },
    { id: 'friendly', icon: '😊', i18nKey: 'action_friendly' },
    { id: 'diplomatic', icon: '🤝', i18nKey: 'action_diplomatic' },
    { id: 'complete', icon: '🔮', i18nKey: 'action_complete', feature: 'generate' },
    { id: 'suggest_next', icon: '💭', i18nKey: 'action_suggest_next', feature: 'generate' },
    { id: 'reply_generate', icon: '↩️', i18nKey: 'action_reply_generate', feature: 'generate', special: 'reply' },
    { id: 'from_bullets', icon: '📋', i18nKey: 'action_from_bullets', feature: 'generate' },
    { id: 'generate_subject', icon: '📌', i18nKey: 'action_generate_subject', feature: 'generate', special: 'subject' },
    { id: 'analyze_tone', icon: '🎭', i18nKey: 'action_analyze_tone', feature: 'analysis', special: 'analyze' },
    { id: 'analyze_sentiment', icon: '🔍', i18nKey: 'action_analyze_sentiment', feature: 'analysis', special: 'analyzeSentiment' },
    { id: 'detect_ambiguity', icon: '⚠️', i18nKey: 'action_detect_ambiguity', feature: 'analysis', special: 'analyze' },
    { id: 'pre_send_check', icon: '✅', i18nKey: 'action_pre_send_check', feature: 'analysis', special: 'analyze' },
    { id: 'summarize_thread', icon: '📑', i18nKey: 'action_summarize_thread', feature: 'analysis', special: 'summarizeThread' },
    { id: 'learn_style', icon: '🧠', i18nKey: 'action_learn_style', feature: 'learning', special: 'learnStyle' },
    { id: 'bilingual', icon: '🌍', i18nKey: 'action_bilingual', feature: 'generate' },
    { id: 'from_transcription', icon: '🎙️', i18nKey: 'action_from_transcription', feature: 'generate' },
    { id: 'readability', icon: '📊', i18nKey: 'action_readability', feature: 'analysis', special: 'analyze' },
    { id: 'suggest_cc', icon: '👥', i18nKey: 'action_suggest_cc', feature: 'analysis', special: 'analyze' },
    { id: 'adapt_thread', icon: '🔗', i18nKey: 'action_adapt_thread', feature: 'generate', special: 'adaptThread' },
    { id: 'generate_signature', icon: '✍️', i18nKey: 'action_generate_signature', feature: 'generate', special: 'generateSignature' },
    { id: 'batch', icon: '⚡', i18nKey: 'action_batch', feature: 'generate', special: 'batch' },
    { id: 'recipient_context', icon: '🎯', i18nKey: 'prompt_recipient_context_name', special: 'recipientContext' },
    { id: 'insert_snippet', icon: '📎', i18nKey: 'opt_snippets', feature: 'generate', special: 'snippets' }
  ];

  // Filtrar acciones segun features activas
  const visibleActions = actions.filter(a => {
    if (!a.feature) return true;
    return featureConfig[a.feature] !== false;
  });

  // Ocultar/mostrar secciones avanzadas segun config (compatible TB 115+)
  const toneSection = document.getElementById('sel-tone')?.closest('.option-group');
  const lengthSection = document.querySelector('.length-control')?.closest('.option-group');
  const translateSection = document.getElementById('sel-translate')?.closest('.option-group');

  if (toneSection) toneSection.classList.toggle('hidden', featureConfig.tone === false);
  if (lengthSection) lengthSection.classList.toggle('hidden', featureConfig.length === false);
  if (translateSection) translateSection.classList.toggle('hidden', featureConfig.translate === false);

  // Si todas las opciones avanzadas estan desactivadas, ocultar la seccion
  const advancedSection = document.querySelector('.advanced-section');
  if (advancedSection) {
    const allHidden = featureConfig.tone === false &&
      featureConfig.length === false &&
      featureConfig.translate === false;
    advancedSection.classList.toggle('hidden', allHidden);
  }

  container.innerHTML = '';
  visibleActions.forEach(action => {
    const btn = document.createElement('button');
    btn.className = 'action-btn' + (action.primary ? ' primary' : '');
    const label = msg(action.i18nKey);
    btn.innerHTML = `<span class="action-icon">${action.icon}</span><span class="action-label">${label}</span>`;
    btn.addEventListener('click', () => {
      if (action.special === 'reply') {
        showView('reply');
      } else if (action.special === 'subject') {
        startGenerateSubject();
      } else if (action.special === 'analyze') {
        startAnalysis(action.id, msg(action.i18nKey));
      } else if (action.special === 'analyzeSentiment') {
        startAnalysisSentiment();
      } else if (action.special === 'summarizeThread') {
        startSummarizeThread();
      } else if (action.special === 'learnStyle') {
        startLearnStyle();
      } else if (action.special === 'adaptThread') {
        startAdaptThread();
      } else if (action.special === 'generateSignature') {
        runAnalysisAction('generateSignature', { info: '' }, msg('loading_generating_signature'), msg('action_generate_signature'));
      } else if (action.special === 'batch') {
        startBatch();
      } else if (action.special === 'snippets') {
        showSnippetsView();
      } else if (action.special === 'recipientContext') {
        showView('recipient');
      } else {
        startAction(action.id);
      }
    });
    container.appendChild(btn);
  });
}

// --- Generar respuesta ---

async function startGenerateReply() {
  if (!isReady || isProcessing) return;
  isProcessing = true;

  const instructions = document.getElementById('reply-instructions').value.trim().substring(0, LIMITS.MAX_REPLY_INSTRUCTIONS_LENGTH);
  document.getElementById('loading-text').textContent = msg('loading_generating_reply');
  showView('loading');

  try {
    const result = await sendMessage('generateReply', { instructions });
    if (!document.body) return;

    if (result.success) {
      originalText = result.original;
      improvedText = result.improved;
      document.getElementById('tab-improved').textContent = improvedText;
      document.getElementById('tab-original').textContent = originalText;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelector('[data-tab="improved"]').classList.add('active');
      document.getElementById('tab-improved').classList.remove('hidden');
      document.getElementById('tab-original').classList.add('hidden');
      showView('preview');
    } else {
      showError(result.error);
    }
  } catch (error) {
    if (!document.body) return;
    showError(msg('error_generic', error.message));
  } finally {
    isProcessing = false;
  }
}

// --- Generar asunto ---

async function startGenerateSubject() {
  if (!isReady || isProcessing) return;
  isProcessing = true;

  document.getElementById('loading-text').textContent = msg('loading_generating_subjects');
  showView('loading');

  try {
    const result = await sendMessage('generateSubject');
    if (!document.body) return;

    if (result.success && result.subjects?.length > 0) {
      const container = document.getElementById('subject-options');
      container.innerHTML = '';
      result.subjects.forEach(subject => {
        const btn = document.createElement('button');
        btn.className = 'subject-option';
        btn.textContent = subject;
        btn.addEventListener('click', () => applySubject(subject));
        container.appendChild(btn);
      });
      showView('subject');
    } else {
      showError(result.error || msg('error_no_subjects'));
    }
  } catch (error) {
    if (!document.body) return;
    showError(msg('error_generic', error.message));
  } finally {
    isProcessing = false;
  }
}

// --- Analisis (funcion generica para evitar duplicacion) ---

async function runAnalysisAction(messageAction, payload, loadingText, titleText, resultKey) {
  if (!isReady || isProcessing) return;
  isProcessing = true;
  const currentReqId = ++requestId;

  document.getElementById('loading-text').textContent = loadingText;
  showView('loading');

  try {
    const result = await sendMessage(messageAction, payload);
    if (!document.body || currentReqId !== requestId) return;

    const text = result[resultKey || 'analysis'] || result.message;
    if (result.success && text) {
      document.getElementById('analysis-title').textContent = titleText;
      document.getElementById('analysis-result').textContent = text;
      showView('analysis');
    } else {
      showError(result.error || msg('error_no_result'));
    }
  } catch (error) {
    if (!document.body || currentReqId !== requestId) return;
    showError(msg('error_generic', error.message));
  } finally {
    isProcessing = false;
  }
}

function startAnalysis(analysisType, title) {
  return runAnalysisAction('analyze', { analysisType }, msg('loading_analyzing'), title);
}

function startAnalysisSentiment() {
  return runAnalysisAction('analyzeSentiment', {}, msg('loading_analyzing_sentiment'), msg('action_analyze_sentiment'));
}

function startSummarizeThread() {
  return runAnalysisAction('summarizeThread', {}, msg('loading_summarizing'), msg('action_summarize_thread'));
}

function startLearnStyle() {
  return runAnalysisAction('learnStyle', {}, msg('loading_learning'), msg('action_learn_style'), 'message');
}

async function startAdaptThread() {
  if (!isReady || isProcessing) return;
  isProcessing = true;
  const currentReqId = ++requestId;
  document.getElementById('loading-text').textContent = msg('loading_adapting');
  showView('loading');

  try {
    const result = await sendMessage('adaptThread');
    if (!document.body || currentReqId !== requestId) return;

    if (result.success) {
      originalText = result.original;
      improvedText = result.improved;
      document.getElementById('tab-improved').textContent = improvedText;
      document.getElementById('tab-original').textContent = originalText;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelector('[data-tab="improved"]').classList.add('active');
      document.getElementById('tab-improved').classList.remove('hidden');
      document.getElementById('tab-original').classList.add('hidden');
      showView('preview');
    } else {
      showError(result.error);
    }
  } catch (error) {
    if (!document.body || currentReqId !== requestId) return;
    showError(msg('error_generic', error.message));
  } finally {
    isProcessing = false;
  }
}

async function showSnippetsView() {
  // Cargar snippets desde storage
  const stored = await browser.storage.local.get('snippets');
  const snippets = stored.snippets || [];
  const container = document.getElementById('snippet-select-list');
  container.innerHTML = '';

  if (snippets.length === 0) {
    container.innerHTML = `<p class="field-hint">${msg('empty_no_templates')}</p>`;
    showView('snippets');
    return;
  }

  snippets.forEach(snippet => {
    const btn = document.createElement('button');
    btn.className = 'subject-option';
    btn.textContent = `📎 ${snippet.name}`;
    btn.addEventListener('click', () => insertSnippet(snippet.id));
    container.appendChild(btn);
  });
  showView('snippets');
}

async function insertSnippet(snippetId) {
  if (isProcessing) return;
  isProcessing = true;
  document.getElementById('loading-text').textContent = msg('status_processing');
  showView('loading');

  try {
    const result = await sendMessage('insertSnippet', { snippetId });
    if (!document.body) return;
    if (result.success && result.improved) {
      originalText = result.original || '';
      improvedText = result.improved;
      document.getElementById('tab-improved').textContent = improvedText;
      document.getElementById('tab-original').textContent = originalText;
      showView('preview');
    } else if (result.success) {
      showView('applied');
    } else {
      showError(result.error);
    }
  } catch (error) {
    showError(msg('error_generic', error.message));
  } finally {
    isProcessing = false;
  }
}

async function startBatch() {
  return runAnalysisAction('batchImprove', { profileId: 'improve' }, msg('loading_batch'), msg('action_batch'), 'message');
}

async function applySubject(subject) {
  try {
    // Establecer el asunto via compose API
    await browser.compose.setComposeDetails(
      currentTabId,
      { subject: subject }
    );
    showView('applied');
  } catch (error) {
    showError(msg('error_applying_subject', error.message));
  }
}

// --- Event Listeners ---

// Cancelar
document.getElementById('btn-cancel').addEventListener('click', async () => {
  try {
    await sendMessage('cancel');
  } catch (_) {}
  showView('initial');
});

// Aceptar
document.getElementById('btn-accept').addEventListener('click', applyImproved);

// Descartar
document.getElementById('btn-discard').addEventListener('click', () => {
  showView('initial');
});

// Deshacer
document.getElementById('btn-undo').addEventListener('click', undoImprove);

// Otra accion (volver al inicio)
document.getElementById('btn-another').addEventListener('click', () => {
  showView('initial');
});

// Reintentar
document.getElementById('btn-retry').addEventListener('click', () => {
  startAction(lastActionId);
});

// Opciones
document.getElementById('btn-options').addEventListener('click', () => {
  browser.runtime.openOptionsPage();
  window.close();
});

// Generar respuesta
document.getElementById('btn-reply-go').addEventListener('click', startGenerateReply);
document.getElementById('btn-reply-cancel').addEventListener('click', () => {
  showView('initial');
});

// Generar asunto - volver
document.getElementById('btn-subject-cancel').addEventListener('click', () => {
  showView('initial');
});

// Analisis - volver
document.getElementById('btn-analysis-back').addEventListener('click', () => {
  showView('initial');
});

// Contexto destinatario
document.getElementById('btn-recipient-go').addEventListener('click', async () => {
  const type = document.getElementById('sel-recipient-type').value;
  if (!isReady || isProcessing) return;
  isProcessing = true;
  const currentReqId = ++requestId;
  document.getElementById('loading-text').textContent = msg('loading_tone');
  showView('loading');

  try {
    const result = await sendMessage('recipientContext', { recipientType: type });
    if (!document.body || currentReqId !== requestId) return;
    if (result.success) {
      originalText = result.original;
      improvedText = result.improved;
      document.getElementById('tab-improved').textContent = improvedText;
      document.getElementById('tab-original').textContent = originalText;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelector('[data-tab="improved"]').classList.add('active');
      document.getElementById('tab-improved').classList.remove('hidden');
      document.getElementById('tab-original').classList.add('hidden');
      showView('preview');
    } else {
      showError(result.error);
    }
  } catch (error) {
    showError(msg('error_generic', error.message));
  } finally {
    isProcessing = false;
  }
});

document.getElementById('btn-recipient-cancel').addEventListener('click', () => {
  showView('initial');
});

// Snippets - volver
document.getElementById('btn-snippets-cancel').addEventListener('click', () => {
  showView('initial');
});

// Tabs de previsualizacion
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;
    document.getElementById('tab-improved').classList.toggle('hidden', target !== 'improved');
    document.getElementById('tab-original').classList.toggle('hidden', target !== 'original');
  });
});

// Length buttons
document.querySelectorAll('.len-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.len-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// --- Inicializacion ---
(async () => {
  applyI18n();
  currentTabId = await getCurrentTabId();
  await renderQuickActions();

  // Indicador de proveedor (local/cloud)
  try {
    const stored = await browser.storage.local.get('apiConfig');
    const config = stored.apiConfig || {};
    const hint = document.querySelector('.hint');
    if (hint) {
      if (config.provider === 'ollama') {
        hint.textContent = '🟢 ' + msg('hint_ollama_local');
        hint.style.color = '#166534';
      } else if (config.provider) {
        const name = config.provider === 'custom' ? msg('provider_custom') :
          config.provider.charAt(0).toUpperCase() + config.provider.slice(1);
        hint.textContent = '☁️ ' + msg('hint_cloud_provider', name);
      }
    }
  } catch (_) {}

  isReady = true;
})();
