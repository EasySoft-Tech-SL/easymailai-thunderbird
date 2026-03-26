/**
 * EasyMailAI - Background Script
 * Coordina la comunicacion entre el popup, la compose API y la IA
 * Desarrollado por Easysoft Tech S.L. (https://easysoft.es)
 */

// Estado por tab de composicion
const tabState = new Map();

/**
 * Limpia estados antiguos si se supera el limite
 */
function cleanOldStates() {
  if (tabState.size > LIMITS.MAX_COMPOSE_STATES) {
    const keys = Array.from(tabState.keys());
    keys.slice(0, tabState.size - LIMITS.MAX_COMPOSE_STATES).forEach(k => tabState.delete(k));
  }
}

/**
 * Obtiene el contenido del compositor
 * @param {number} tabId
 * @returns {Promise<{body: string, isPlainText: boolean}>}
 */
async function getComposeContent(tabId) {
  const details = await browser.compose.getComposeDetails(tabId);
  const isPlainText = details.isPlainText;
  const body = isPlainText ? details.plainTextBody : details.body;
  return { body, isPlainText };
}

/**
 * Establece el contenido del compositor
 * @param {number} tabId
 * @param {string} content
 * @param {boolean} isPlainText
 */
async function setComposeContent(tabId, content, isPlainText) {
  if (isPlainText) {
    await browser.compose.setComposeDetails(tabId, { plainTextBody: content });
  } else {
    await browser.compose.setComposeDetails(tabId, { body: content });
  }
}

/**
 * Procesa el texto con la IA
 * @param {string} text - Texto a procesar
 * @param {AbortSignal} signal - Para cancelar
 * @param {string} [profileId] - ID del perfil/prompt a usar
 * @param {string} [extraInstructions] - Instrucciones extra (tono, longitud, idioma)
 * @param {number} [tabId] - Tab del compositor (para contexto de cuenta)
 */
async function processWithAI(text, signal, profileId, extraInstructions, tabId) {
  const config = await ApiClient.getConfig();

  try {
    const url = new URL(config.baseUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error(msg('error_invalid_protocol'));
    }
  } catch (err) {
    if (err.message.includes('protocolo')) throw err;
    throw new Error(msg('error_invalid_url'));
  }

  if (!config.model) {
    throw new Error(msg('error_no_model'));
  }

  if (PROVIDERS[config.provider]?.requiresKey && !config.apiKey) {
    throw new Error(msg('error_requires_key', PROVIDERS[config.provider]?.name || config.provider));
  }

  // Obtener prompt segun perfil o activo
  let prompt = await PromptManager.getActivePrompt(profileId);

  // Añadir estilo de escritura aprendido si esta activado
  const featureStored = await browser.storage.local.get('featureConfig');
  const featureConfig = featureStored.featureConfig || {};
  if (featureConfig.learningMode !== false) {
    const styleContext = await PromptManager.getWritingStyleContext();
    if (styleContext) {
      prompt += styleContext;
    }
  }

  // Añadir contexto de cuenta si esta disponible
  if (tabId) {
    try {
      const details = await browser.compose.getComposeDetails(tabId);
      if (details.identityId) {
        const accounts = await browser.accounts.list();
        for (const account of accounts) {
          const identity = account.identities?.find(id => id.id === details.identityId);
          if (identity) {
            const ctxStored = await browser.storage.local.get(STORAGE_KEYS.accountContexts);
            const ctx = (ctxStored[STORAGE_KEYS.accountContexts] || {})[account.id];
            if (ctx) {
              if (ctx.tone) prompt += `\nUse a ${ctx.tone} tone.`;
              if (ctx.lang) prompt += `\nWrite the response in ${LANGUAGE_NAMES[ctx.lang] || ctx.lang}.`;
            }
            break;
          }
        }
      }
    } catch (_) {}
  }

  // Añadir instrucciones extra si las hay
  if (extraInstructions && typeof extraInstructions === 'string' && extraInstructions.trim()) {
    prompt += '\n\nAdditional instructions:\n' + extraInstructions.trim();
  }

  // Intentar con proveedor principal, fallback si falla
  try {
    return await ApiClient.complete(config, prompt, text, signal);
  } catch (primaryError) {
    if (primaryError.name === 'AbortError') throw primaryError;

    // Intentar fallback
    const fallbacks = await ApiClient.getFallbackConfigs();
    if (fallbacks.length > 0) {
      for (const fb of fallbacks) {
        if (!fb.baseUrl || !fb.model) continue;
        try {
          return await ApiClient.complete(fb, prompt, text, signal);
        } catch (fbError) {
          if (fbError.name === 'AbortError') throw fbError;
        }
      }
    }

    throw primaryError;
  }
}

// Listener de mensajes desde el popup
browser.runtime.onMessage.addListener((message, sender) => {
  const tabId = message.tabId;

  switch (message.action) {
    case 'getContent':
      return handleGetContent(tabId);

    case 'improve':
      return handleImprove(tabId, message.profileId, message.extraInstructions, message.selectedText);

    case 'applyImproved':
      return handleApply(tabId, message.improvedText);

    case 'undo':
      return handleUndo(tabId);

    case 'cancel':
      return handleCancel(tabId);

    case 'generateReply':
      return handleGenerateReply(tabId, message.instructions);

    case 'generateSubject':
      return handleGenerateSubject(tabId);

    case 'analyze':
      return handleAnalyze(tabId, message.analysisType);

    case 'analyzeSentiment':
      return handleAnalyzeSentiment(tabId);

    case 'summarizeThread':
      return handleSummarizeThread(tabId);

    case 'applyTemplate':
      return handleApplyTemplate(tabId, message.templateId, message.variables);

    case 'learnStyle':
      return handleLearnStyle(tabId);

    case 'adaptThread':
      return handleAdaptThread(tabId);

    case 'exportConfig':
      return handleExportConfig();

    case 'importConfig':
      return handleImportConfig(message.configData);

    case 'getHistory':
      return handleGetHistory();

    case 'recipientContext':
      return handleRecipientContext(tabId, message.recipientType);

    case 'insertSnippet':
      return handleInsertSnippet(tabId, message.snippetId);

    case 'batchImprove':
      return handleBatchImprove(message.profileId);

    case 'generateSignature':
      return handleGenerateSignature(tabId, message.info);

    case 'autocomplete':
      return handleAutocomplete(message.text);

    default:
      return Promise.resolve({ error: `Unknown action: ${message.action}` });
  }
});

async function handleGetContent(tabId) {
  try {
    const { body, isPlainText } = await getComposeContent(tabId);
    const extracted = TextProcessor.extractEditable(body);
    return { success: true, text: extracted.editableText, isHtml: !isPlainText };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleImprove(tabId, profileId, extraInstructions, selectedText) {
  try {
    const { body, isPlainText } = await getComposeContent(tabId);
    const extracted = TextProcessor.extractEditable(body);

    const hasSelection = selectedText && selectedText.trim().length > 0;
    const trimmed = hasSelection ? selectedText.trim() : extracted.editableText.trim();

    if (!trimmed) {
      return { success: false, error: msg('error_email_empty') };
    }

    if (trimmed.length < LIMITS.MIN_IMPROVE_TEXT_LENGTH) {
      return { success: false, error: msg('error_text_too_short') };
    }

    if (trimmed.length > LIMITS.MAX_BODY_CHARS) {
      return {
        success: false,
        error: msg('error_email_too_long', String(trimmed.length), String(LIMITS.MAX_BODY_CHARS))
      };
    }

    // Abortar operacion previa si existe
    const prevState = tabState.get(tabId);
    if (prevState?.abortController) {
      prevState.abortController.abort();
    }

    // Guardar estado original para deshacer
    cleanOldStates();
    tabState.set(tabId, {
      originalBody: body,
      isPlainText,
      suffix: extracted.suffix,
      isHtml: extracted.isHtml,
      selectedText: hasSelection ? trimmed : null
    });

    // Crear AbortController para cancelacion
    const controller = new AbortController();
    tabState.get(tabId).abortController = controller;

    const improvedText = await processWithAI(trimmed, controller.signal, profileId, extraInstructions, tabId);

    // Limpiar referencia al controller
    const state = tabState.get(tabId);
    if (state) delete state.abortController;

    // Guardar en historial
    saveToHistory(trimmed, improvedText, profileId || 'improve').catch(() => {});

    return {
      success: true,
      original: trimmed,
      improved: improvedText
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, error: msg('error_cancelled') };
    }
    return { success: false, error: error.message };
  }
}

async function handleApply(tabId, improvedText) {
  try {
    const state = tabState.get(tabId);
    if (!state) {
      return { success: false, error: msg('error_no_state') };
    }

    let finalContent;
    if (state.selectedText) {
      // Reemplazar solo la seleccion en el body original
      finalContent = state.originalBody.replace(state.selectedText, improvedText);
    } else {
      finalContent = TextProcessor.reconstruct(
        improvedText,
        state.suffix,
        state.isHtml
      );
    }

    await setComposeContent(tabId, finalContent, state.isPlainText);
    // Estado se mantiene para poder deshacer
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleUndo(tabId) {
  try {
    const state = tabState.get(tabId);
    if (!state) {
      return { success: false, error: msg('error_no_previous') };
    }

    await setComposeContent(tabId, state.originalBody, state.isPlainText);
    tabState.delete(tabId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Controllers para operaciones de generacion
let generateReplyController = null;
let generateSubjectController = null;

/**
 * Helper: ejecuta complete con fallback
 */
async function completeWithFallback(prompt, userMessage, signal) {
  const config = await ApiClient.getConfig();
  try {
    return await ApiClient.complete(config, prompt, userMessage, signal);
  } catch (primaryError) {
    if (primaryError.name === 'AbortError') throw primaryError;
    const fallbacks = await ApiClient.getFallbackConfigs();
    for (const fb of fallbacks) {
      if (!fb.baseUrl || !fb.model) continue;
      try {
        return await ApiClient.complete(fb, prompt, userMessage, signal);
      } catch (fbError) {
        if (fbError.name === 'AbortError') throw fbError;
      }
    }
    throw primaryError;
  }
}

/**
 * Genera una respuesta basada en el correo al que se responde
 */
async function handleGenerateReply(tabId, instructions) {
  try {
    // Cancelar peticion previa
    if (generateReplyController) generateReplyController.abort();
    generateReplyController = new AbortController();

    const details = await browser.compose.getComposeDetails(tabId);
    const fullBody = details.isPlainText ? details.plainTextBody : details.body;
    const { newContent, quotedContent } = TextProcessor.separateQuotedContent(
      fullBody, !details.isPlainText
    );

    if (!quotedContent) {
      return { success: false, error: msg('error_no_quoted') };
    }

    const quotedText = !details.isPlainText
      ? TextProcessor.htmlToPlainText(quotedContent)
      : quotedContent;

    // Separar contenido del correo de las instrucciones (mitigacion prompt injection)
    let userMessage = `=== CORREO RECIBIDO ===\n${quotedText.substring(0, LIMITS.MAX_QUOTED_CONTENT_LENGTH)}\n=== FIN CORREO ===`;
    const trimmedInstructions = (instructions || '').trim().substring(0, LIMITS.MAX_REPLY_INSTRUCTIONS_LENGTH);
    if (trimmedInstructions) {
      userMessage += `\n\nInstrucciones: ${trimmedInstructions}`;
    }

    const prompt = await PromptManager.getPromptById('reply_generate');
    const reply = await completeWithFallback(prompt, userMessage, generateReplyController.signal);
    generateReplyController = null;

    return { success: true, improved: reply, original: newContent || '' };
  } catch (error) {
    if (error.name === 'AbortError') return { success: false, error: msg('error_cancelled') };
    return { success: false, error: error.message };
  }
}

/**
 * Genera lineas de asunto basadas en el cuerpo del correo
 */
async function handleGenerateSubject(tabId) {
  try {
    if (generateSubjectController) generateSubjectController.abort();
    generateSubjectController = new AbortController();

    const { body, isPlainText } = await getComposeContent(tabId);
    const extracted = TextProcessor.extractEditable(body);
    const text = extracted.editableText.trim();

    if (!text || text.length < 5) {
      return { success: false, error: msg('error_write_first_subject') };
    }

    const prompt = await PromptManager.getPromptById('generate_subject');
    const result = await completeWithFallback(prompt, text.substring(0, LIMITS.MAX_SUBJECT_GENERATION_LENGTH), generateSubjectController.signal);
    generateSubjectController = null;

    const subjects = result.split('\n')
      .map(s => s.replace(/^\d+[\.\)\-]\s*/, '').trim())
      .filter(s => s.length > 0 && s.length <= 120);

    if (subjects.length === 0) {
      return { success: false, error: msg('error_no_valid_subjects') };
    }

    return { success: true, subjects: subjects.slice(0, 5) };
  } catch (error) {
    if (error.name === 'AbortError') return { success: false, error: msg('error_cancelled') };
    return { success: false, error: error.message };
  }
}

// Controller compartido para operaciones de analisis
let analysisController = null;

/**
 * Helper: valida que feature de analisis este activada
 */
async function checkAnalysisEnabled() {
  const stored = await browser.storage.local.get('featureConfig');
  const config = stored.featureConfig || {};
  if (config.analysis === false) {
    throw new Error(msg('error_analysis_disabled'));
  }
}

/**
 * Analiza el correo actual (tono, ambiguedad, checklist)
 */
async function handleAnalyze(tabId, analysisType) {
  try {
    await checkAnalysisEnabled();

    if (analysisController) analysisController.abort();
    analysisController = new AbortController();

    const { body, isPlainText } = await getComposeContent(tabId);
    const extracted = TextProcessor.extractEditable(body);
    const text = extracted.editableText.trim();

    if (!text || text.length < 10) {
      return { success: false, error: msg('error_write_first') };
    }

    const prompt = await PromptManager.getPromptById(analysisType);
    const result = await completeWithFallback(prompt, text.substring(0, LIMITS.MAX_ANALYSIS_LENGTH), analysisController.signal);
    analysisController = null;
    return { success: true, analysis: result };
  } catch (error) {
    if (error.name === 'AbortError') return { success: false, error: msg('error_cancelled') };
    return { success: false, error: error.message };
  }
}

/**
 * Analiza sentimiento del correo recibido (citado)
 */
async function handleAnalyzeSentiment(tabId) {
  try {
    await checkAnalysisEnabled();

    if (analysisController) analysisController.abort();
    analysisController = new AbortController();

    const details = await browser.compose.getComposeDetails(tabId);
    const fullBody = details.isPlainText ? details.plainTextBody : details.body;
    const { quotedContent } = TextProcessor.separateQuotedContent(fullBody, !details.isPlainText);

    if (!quotedContent) {
      return { success: false, error: msg('error_no_quoted_analyze') };
    }

    const quotedText = !details.isPlainText
      ? TextProcessor.htmlToPlainText(quotedContent)
      : quotedContent;

    const prompt = await PromptManager.getPromptById('analyze_sentiment');
    const result = await completeWithFallback(
      prompt,
      `=== CORREO RECIBIDO ===\n${quotedText.substring(0, LIMITS.MAX_QUOTED_CONTENT_LENGTH)}\n=== FIN ===`,
      analysisController.signal
    );
    analysisController = null;
    return { success: true, analysis: result };
  } catch (error) {
    if (error.name === 'AbortError') return { success: false, error: msg('error_cancelled') };
    return { success: false, error: error.message };
  }
}

/**
 * Resume el hilo completo de correos
 */
async function handleSummarizeThread(tabId) {
  try {
    await checkAnalysisEnabled();

    if (analysisController) analysisController.abort();
    analysisController = new AbortController();

    const details = await browser.compose.getComposeDetails(tabId);
    const fullBody = details.isPlainText ? details.plainTextBody : details.body;

    const text = !details.isPlainText
      ? TextProcessor.htmlToPlainText(fullBody)
      : fullBody;

    if (!text || text.trim().length < 20) {
      return { success: false, error: msg('error_insufficient_content') };
    }

    const prompt = await PromptManager.getPromptById('summarize_thread');
    const result = await completeWithFallback(prompt, text.substring(0, LIMITS.MAX_SUMMARIZE_LENGTH), analysisController.signal);
    analysisController = null;
    return { success: true, analysis: result };
  } catch (error) {
    if (error.name === 'AbortError') return { success: false, error: msg('error_cancelled') };
    return { success: false, error: error.message };
  }
}

/**
 * Aplica una plantilla al compositor
 */
async function handleApplyTemplate(tabId, templateId, variables) {
  try {
    const templates = await PromptManager.getTemplates();
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      return { success: false, error: msg('error_template_not_found') };
    }

    // Resolver variables pasadas manualmente
    let content = template.content;
    if (variables && typeof variables === 'object') {
      content = PromptManager.resolveVariables(content, variables);
    }

    // Si hay variables sin resolver, recopilar contexto del compositor
    const unresolvedVars = PromptManager.extractVariables(content);
    if (unresolvedVars.length > 0) {
      // Leer todo el contexto disponible del compositor
      const details = await browser.compose.getComposeDetails(tabId);
      const contextParts = [];

      // Destinatarios
      if (details.to?.length > 0) {
        contextParts.push(`To: ${details.to.join(', ')}`);
      }
      if (details.cc?.length > 0) {
        contextParts.push(`CC: ${details.cc.join(', ')}`);
      }

      // Asunto
      if (details.subject) {
        contextParts.push(`Subject: ${details.subject}`);
      }

      // Remitente
      if (details.from) {
        contextParts.push(`From: ${details.from}`);
      }

      // Cuerpo existente (si ya hay texto escrito)
      const bodyText = details.isPlainText ? details.plainTextBody : details.body;
      if (bodyText) {
        const plainBody = details.isPlainText ? bodyText : TextProcessor.htmlToPlainText(bodyText);
        if (plainBody.trim()) {
          contextParts.push(`Email body already written:\n${plainBody.substring(0, 1000)}`);
        }
      }

      // Correo citado (si es una respuesta, puede tener info del contacto)
      if (bodyText) {
        const { quotedContent } = TextProcessor.separateQuotedContent(bodyText, !details.isPlainText);
        if (quotedContent) {
          const quotedText = !details.isPlainText
            ? TextProcessor.htmlToPlainText(quotedContent)
            : quotedContent;
          contextParts.push(`Previous email in thread:\n${quotedText.substring(0, 500)}`);
        }
      }

      const context = contextParts.join('\n');

      const prompt = `Fill the fields marked with {name} in the following email template.
Use REAL data from the context provided (recipient names, subject, etc).
NEVER invent names or data - use what is available in the context.
If a field cannot be determined from the context, leave the {field} placeholder as is.
Respond ONLY with the completed template:`;

      const userMessage = `=== CONTEXT ===\n${context}\n=== TEMPLATE ===\n${content}\n=== END ===`;
      content = await completeWithFallback(prompt, userMessage);
    }

    const { isPlainText } = await getComposeContent(tabId);
    const htmlContent = TextProcessor.plainTextToHtml(content);
    await setComposeContent(tabId, isPlainText ? content : htmlContent, isPlainText);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Aprende el estilo de escritura del correo actual
 */
async function handleLearnStyle(tabId) {
  try {
    const { body, isPlainText } = await getComposeContent(tabId);
    const extracted = TextProcessor.extractEditable(body);
    const text = extracted.editableText.trim();

    if (!text || text.length < 50) {
      return { success: false, error: msg('error_too_short_learning') };
    }

    await PromptManager.saveWritingStyle(text);
    return { success: true, message: msg('msg_style_saved') };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Adapta el correo al tono del hilo existente
 */
async function handleAdaptThread(tabId) {
  try {
    if (analysisController) analysisController.abort();
    analysisController = new AbortController();

    const details = await browser.compose.getComposeDetails(tabId);
    const fullBody = details.isPlainText ? details.plainTextBody : details.body;
    const isHtml = !details.isPlainText;

    const { newContent, quotedContent } = TextProcessor.separateQuotedContent(fullBody, isHtml);
    const newText = isHtml ? TextProcessor.htmlToPlainText(newContent) : newContent;
    const quotedText = quotedContent
      ? (isHtml ? TextProcessor.htmlToPlainText(quotedContent) : quotedContent)
      : '';

    if (!newText.trim()) {
      return { success: false, error: msg('error_write_first') };
    }
    if (!quotedText.trim()) {
      return { success: false, error: msg('error_no_thread') };
    }

    const prompt = await PromptManager.getPromptById('adapt_thread');
    const userMessage = `=== MI CORREO ===\n${newText.substring(0, LIMITS.MAX_ADAPT_THREAD_LENGTH)}\n=== HILO ANTERIOR ===\n${quotedText.substring(0, LIMITS.MAX_ADAPT_THREAD_LENGTH)}\n=== FIN ===`;
    const result = await completeWithFallback(prompt, userMessage, analysisController.signal);
    analysisController = null;

    // Guardar estado para deshacer
    cleanOldStates();
    tabState.set(tabId, {
      originalBody: fullBody,
      isPlainText: details.isPlainText,
      suffix: quotedContent || '',
      isHtml
    });

    saveToHistory(newText, result, 'adapt_thread').catch(() => {});
    return { success: true, improved: result, original: newText };
  } catch (error) {
    analysisController = null;
    if (error.name === 'AbortError') return { success: false, error: msg('error_cancelled') };
    return { success: false, error: error.message };
  }
}

// --- Historial de mejoras ---

async function saveToHistory(original, improved, action) {
  const stored = await browser.storage.local.get(STORAGE_KEYS.improvementHistory);
  const history = stored[STORAGE_KEYS.improvementHistory] || [];
  history.unshift({
    timestamp: Date.now(),
    action,
    originalPreview: original.substring(0, 100),
    improvedPreview: improved.substring(0, 100)
  });
  while (history.length > LIMITS.MAX_IMPROVEMENT_HISTORY) history.pop();
  await browser.storage.local.set({ [STORAGE_KEYS.improvementHistory]: history });
}

async function handleGetHistory() {
  try {
    const stored = await browser.storage.local.get('improvementHistory');
    return { success: true, history: stored.improvementHistory || [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// --- Export/Import configuracion ---

async function handleExportConfig() {
  try {
    const keys = ['apiConfig', 'fallbackProviders', 'featureConfig', 'userPrompt',
      'promptProfiles', 'emailTemplates', 'writingStyle'];
    const data = await browser.storage.local.get(keys);
    // No exportar API keys por seguridad
    if (data.apiConfig) {
      data.apiConfig = { ...data.apiConfig, apiKey: '' };
    }
    if (data.fallbackProviders) {
      data.fallbackProviders = data.fallbackProviders.map(fb => ({ ...fb, apiKey: '' }));
    }
    return {
      success: true,
      configData: JSON.stringify({
        exportedAt: new Date().toISOString(),
        version: browser.runtime.getManifest().version,
        app: 'EasyMailAI',
        ...data
      }, null, 2)
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleImportConfig(configData) {
  try {
    if (!configData || typeof configData !== 'string') {
      return { success: false, error: msg('error_invalid_config') };
    }

    const data = JSON.parse(configData);
    if (data.app !== 'EasyMailAI') {
      return { success: false, error: msg('error_invalid_app') };
    }

    // Validar estructura de datos importados
    if (Array.isArray(data.promptProfiles)) {
      for (const p of data.promptProfiles) {
        if (!p.id || typeof p.name !== 'string' || typeof p.prompt !== 'string') {
          return { success: false, error: msg('error_invalid_prompts') };
        }
      }
    }
    if (Array.isArray(data.emailTemplates)) {
      for (const t of data.emailTemplates) {
        if (!t.id || typeof t.name !== 'string' || typeof t.content !== 'string') {
          return { success: false, error: msg('error_invalid_templates') };
        }
      }
    }

    // Importar solo claves conocidas (no API keys)
    const safeKeys = ['featureConfig', 'userPrompt', 'promptProfiles', 'emailTemplates'];
    for (const key of safeKeys) {
      if (data[key] !== undefined) {
        await browser.storage.local.set({ [key]: data[key] });
      }
    }

    // Importar config de proveedor SIN API key
    if (data.apiConfig) {
      if (!data.apiConfig.baseUrl?.trim() || !data.apiConfig.model?.trim()) {
        return { success: false, error: msg('error_invalid_api_config') };
      }
      const current = await ApiClient.getConfig();
      await browser.storage.local.set({
        apiConfig: {
          ...data.apiConfig,
          apiKey: current.apiKey
        }
      });
    }

    return { success: true, message: msg('success_imported') };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { success: false, error: msg('error_invalid_json') };
    }
    return { success: false, error: error.message };
  }
}

/**
 * Mejora el correo adaptando al tipo de destinatario
 */
async function handleRecipientContext(tabId, recipientType) {
  try {
    const { body, isPlainText } = await getComposeContent(tabId);
    const extracted = TextProcessor.extractEditable(body);
    const text = extracted.editableText.trim();

    if (!text) return { success: false, error: msg('error_email_empty') };

    const prompt = await PromptManager.getPromptById('recipient_context');
    const userMessage = `Destinatario: ${recipientType}\n\n${text.substring(0, LIMITS.MAX_ANALYSIS_LENGTH)}`;

    // Guardar estado para deshacer
    cleanOldStates();
    tabState.set(tabId, { originalBody: body, isPlainText, suffix: extracted.suffix, isHtml: extracted.isHtml });

    const result = await completeWithFallback(prompt, userMessage);
    saveToHistory(text, result, 'recipient_context').catch(() => {});
    return { success: true, improved: result, original: text };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Inserta un snippet integrándolo naturalmente en el correo
 */
async function handleInsertSnippet(tabId, snippetId) {
  try {
    const stored = await browser.storage.local.get('snippets');
    const snippets = stored.snippets || [];
    const snippet = snippets.find(s => s.id === snippetId);
    if (!snippet) return { success: false, error: msg('error_template_not_found') };

    const { body, isPlainText } = await getComposeContent(tabId);
    const extracted = TextProcessor.extractEditable(body);
    const text = extracted.editableText.trim();

    if (!text) {
      // Si el correo esta vacio, simplemente insertar el snippet
      const content = isPlainText ? snippet.content : TextProcessor.plainTextToHtml(snippet.content);
      await setComposeContent(tabId, content + extracted.suffix, isPlainText);
      return { success: true };
    }

    const prompt = await PromptManager.getPromptById('insert_snippet');
    const userMessage = `=== CORREO ACTUAL ===\n${text.substring(0, LIMITS.MAX_ANALYSIS_LENGTH)}\n=== SNIPPET A INTEGRAR ===\n${snippet.content}\n=== FIN ===`;

    cleanOldStates();
    tabState.set(tabId, { originalBody: body, isPlainText, suffix: extracted.suffix, isHtml: extracted.isHtml });

    const result = await completeWithFallback(prompt, userMessage);
    return { success: true, improved: result, original: text };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Modo batch: mejora todos los compositores abiertos
 */
async function handleBatchImprove(profileId) {
  try {
    const composeTabs = await browser.compose.list();
    if (!composeTabs || composeTabs.length === 0) {
      return { success: false, error: msg('error_batch_empty') };
    }

    const results = [];
    for (const tab of composeTabs) {
      try {
        const result = await handleImprove(tab.id, profileId || 'improve', '');
        if (result.success) {
          await handleApply(tab.id, result.improved);
          results.push({ tabId: tab.id, success: true });
        } else {
          results.push({ tabId: tab.id, success: false, error: result.error });
        }
      } catch (err) {
        results.push({ tabId: tab.id, success: false, error: err.message });
      }
    }

    const ok = results.filter(r => r.success).length;
    const fail = results.filter(r => !r.success).length;
    return { success: true, message: `${ok}/${results.length} OK` + (fail ? `, ${fail} errores` : '') };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Genera una firma profesional
 */
async function handleGenerateSignature(tabId, info) {
  try {
    const prompt = await PromptManager.getPromptById('generate_signature');
    const userMessage = info || 'Genera una firma profesional generica.';
    const result = await completeWithFallback(prompt, userMessage);
    return { success: true, analysis: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleCancel(tabId) {
  const state = tabState.get(tabId);
  if (state?.abortController) {
    state.abortController.abort();
    delete state.abortController;
  }
  return { success: true };
}

// AbortController para autocompletado (solo 1 peticion a la vez)
let autocompleteController = null;

/**
 * Obtiene el prompt de autocompletado (configurable o por defecto)
 */
async function getAutocompletePrompt() {
  const stored = await browser.storage.local.get(STORAGE_KEYS.autocompletePrompt);
  return stored[STORAGE_KEYS.autocompletePrompt] || DEFAULT_AUTOCOMPLETE_PROMPT;
}

async function handleAutocomplete(text) {
  try {
    const stored = await browser.storage.local.get(STORAGE_KEYS.featureConfig);
    const featureConfig = stored[STORAGE_KEYS.featureConfig] || {};
    if (featureConfig.autocomplete === false) {
      return { success: false };
    }

    if (!text || text.trim().length < LIMITS.MIN_AUTOCOMPLETE_TEXT_LENGTH) {
      return { success: false };
    }

    const config = await ApiClient.getConfig();
    if (!config.baseUrl || !config.model) {
      return { success: false };
    }

    // Cancelar peticion anterior
    if (autocompleteController) {
      autocompleteController.abort();
    }
    autocompleteController = new AbortController();

    const acPrompt = await getAutocompletePrompt();
    const suggestion = await ApiClient.complete(
      config,
      acPrompt,
      text,
      autocompleteController.signal
    );

    autocompleteController = null;

    // Filtrar respuesta vacia
    if (!suggestion || suggestion.trim().length === 0) {
      return { success: false };
    }

    return { success: true, suggestion: suggestion.trim() };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false };
    }
    return { success: false, error: error.message };
  }
}

// Atajo de teclado: Ctrl+Shift+I abre el popup
browser.commands.onCommand.addListener(async (command) => {
  if (command === 'improve-text') {
    try {
      await browser.composeAction.openPopup();
    } catch (_) {}
  }
});

// --- Menu contextual en compositor ---
const CONTEXT_MENU_ITEMS = [
  { id: 'ctx-improve', titleKey: 'ctx_menu_improve', profileId: 'improve' },
  { id: 'ctx-formalize', titleKey: 'ctx_menu_formalize', profileId: 'formalize' },
  { id: 'ctx-simplify', titleKey: 'ctx_menu_simplify', profileId: 'simplify' },
  { id: 'ctx-shorten', titleKey: 'ctx_menu_shorten', profileId: 'shorten' },
  { id: 'ctx-grammar', titleKey: 'ctx_menu_grammar', profileId: 'grammar' }
];

// Crear menu padre
browser.menus.create({
  id: 'easymailai-menu',
  title: 'EasyMailAI',
  contexts: ['compose_body']
});

// Crear submenus
CONTEXT_MENU_ITEMS.forEach(item => {
  browser.menus.create({
    id: item.id,
    parentId: 'easymailai-menu',
    title: msg(item.titleKey),
    contexts: ['compose_body']
  });
});

// Handler del menu contextual
browser.menus.onClicked.addListener(async (info, tab) => {
  const menuItem = CONTEXT_MENU_ITEMS.find(m => m.id === info.menuItemId);
  if (!menuItem) return;

  const tabId = tab.id;
  const result = await handleImprove(tabId, menuItem.profileId, '');
  if (result.success) {
    await handleApply(tabId, result.improved);
  }
});

// Limpiar estado cuando se cierra un tab
browser.tabs.onRemoved.addListener((tabId) => {
  tabState.delete(tabId);
});

// --- Registrar compose scripts para autocompletado ---
// API: messenger.composeScripts.register() (MV2, TB 82+)
(async () => {
  try {
    const api = messenger?.composeScripts || browser?.composeScripts;
    if (api) {
      // Registrar para todas las futuras ventanas de composicion
      await api.register({
        js: [{ file: 'compose/autocomplete.js' }],
        css: [{ file: 'compose/autocomplete.css' }]
      });

      // Inyectar tambien en ventanas de composicion ya abiertas
      const composeTabs = await messenger.tabs.query({ type: 'messageCompose' });
      for (const tab of composeTabs) {
        try {
          await messenger.tabs.executeScript(tab.id, { file: 'compose/autocomplete.js' });
          await messenger.tabs.insertCSS(tab.id, { file: 'compose/autocomplete.css' });
        } catch (_) {}
      }
    }
  } catch (err) {
    console.log('EasyMailAI: composeScripts not available:', err.message);
  }
})();
