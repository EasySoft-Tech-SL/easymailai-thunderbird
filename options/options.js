/**
 * EasyMailAI - Options Page
 * Configuracion de proveedor, modelo, API key, prompt y perfiles
 * PROVIDERS y DEFAULT_PROMPT se cargan desde lib/constants.js
 */

// Referencias DOM
const elProvider = document.getElementById('provider');
const elBaseUrl = document.getElementById('base-url');
const elApiKey = document.getElementById('api-key');
const elFieldApiKey = document.getElementById('field-apikey');
const elModel = document.getElementById('model');
const elModelCustom = document.getElementById('model-custom');
const elModelStatus = document.getElementById('model-status');
const elPrompt = document.getElementById('prompt');
const elTestResult = document.getElementById('test-result');
const elSaveStatus = document.getElementById('save-status');

// --- Proveedor y Modelos ---

function onProviderChange(isInitialLoad) {
  const provider = elProvider.value;
  const config = PROVIDERS[provider];

  // Solo resetear URL si no es carga inicial (evitar sobreescribir URL personalizada)
  if (!isInitialLoad) {
    elBaseUrl.value = config.baseUrl;
  }
  elFieldApiKey.classList.toggle('hidden', !config.requiresKey);

  // Mostrar select o input libre segun proveedor
  if (provider === 'custom') {
    elModel.classList.add('hidden');
    elModelCustom.classList.remove('hidden');
  } else {
    elModel.classList.remove('hidden');
    elModelCustom.classList.add('hidden');
    // Cargar modelos por defecto (fallback), intentar cargar desde API despues
    if (config.defaultModels?.length > 0) {
      populateModelSelect(config.defaultModels);
    } else {
      populateModelSelect([]);
      // Si no hay modelos por defecto (Ollama), intentar cargar automaticamente
      if (!isInitialLoad) {
        refreshModels();
      }
    }
  }
}

function populateModelSelect(models, selectedModel) {
  elModel.innerHTML = '';
  models.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    elModel.appendChild(opt);
  });
  if (selectedModel && models.includes(selectedModel)) {
    elModel.value = selectedModel;
  }
}

function getSelectedModel() {
  const provider = elProvider.value;
  return provider === 'custom' ? elModelCustom.value.trim() : elModel.value;
}

/**
 * Carga modelos dinamicamente desde la API del proveedor
 */
async function refreshModels() {
  const provider = elProvider.value;
  if (provider === 'custom' && !elBaseUrl.value.trim()) {
    showModelStatus(msg('error_enter_url'), 'error');
    return;
  }

  const config = {
    provider,
    baseUrl: elBaseUrl.value.trim().replace(/\/+$/, ''),
    apiKey: elApiKey.value.trim()
  };

  showModelStatus(msg('loading_models'), '');
  const btnRefresh = document.getElementById('btn-refresh-models');
  btnRefresh.disabled = true;

  try {
    // Usar ApiClient.fetchModels() para evitar duplicar logica
    const models = await ApiClient.fetchModels(config);

    if (models.length === 0) {
      showModelStatus(msg('error_no_models'), 'error');
      return;
    }

    // Guardar en cache
    const cacheKey = `models_${provider}_${btoa(config.baseUrl).substring(0, 20)}`;
    await browser.storage.local.set({
      [cacheKey]: { models, timestamp: Date.now() }
    });

    // Si es custom, cambiar a select
    if (provider === 'custom') {
      elModel.classList.remove('hidden');
      elModelCustom.classList.add('hidden');
    }

    const currentModel = getSelectedModel();
    populateModelSelect(models, currentModel);
    showModelStatus(msg('success_models_loaded', String(models.length)), 'success');
  } catch (error) {
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      showModelStatus(msg('error_timeout'), 'error');
    } else if (error instanceof TypeError) {
      showModelStatus(msg('error_network'), 'error');
    } else {
      showModelStatus(error.message.substring(0, 100), 'error');
    }
  } finally {
    btnRefresh.disabled = false;
  }
}

function showModelStatus(msg, type) {
  elModelStatus.textContent = msg;
  elModelStatus.className = 'field-hint' + (type ? ` ${type}` : '');
  elModelStatus.classList.remove('hidden');
  if (type) {
    setTimeout(() => elModelStatus.classList.add('hidden'), UI_DEFAULTS.errorMessageTimeout);
  }
}

// --- Configuracion ---

async function loadConfig() {
  const stored = await browser.storage.local.get('apiConfig');
  const config = stored.apiConfig || {};

  if (config.provider) {
    elProvider.value = config.provider;
  }
  onProviderChange(true);

  if (config.baseUrl) {
    elBaseUrl.value = config.baseUrl;
  }
  if (config.apiKey) {
    elApiKey.value = config.apiKey;
  }
  if (config.model) {
    const provider = PROVIDERS[elProvider.value];
    if (elProvider.value === 'custom') {
      elModelCustom.value = config.model;
    } else if (provider.defaultModels?.includes(config.model)) {
      elModel.value = config.model;
    } else {
      // Modelo no esta en lista hardcodeada, añadirlo
      const opt = document.createElement('option');
      opt.value = config.model;
      opt.textContent = config.model;
      elModel.appendChild(opt);
      elModel.value = config.model;
    }
  }

  // Prompt
  const promptStored = await browser.storage.local.get(STORAGE_KEYS.userPrompt);
  elPrompt.value = promptStored[STORAGE_KEYS.userPrompt] || DEFAULT_PROMPT;

  // API params
  if (config.temperature !== undefined) {
    document.getElementById('api-temperature').value = config.temperature;
  }
  if (config.maxTokens !== undefined) {
    document.getElementById('api-max-tokens').value = config.maxTokens;
  }

  // Autocomplete prompt
  const acPromptStored = await browser.storage.local.get(STORAGE_KEYS.autocompletePrompt);
  document.getElementById('autocomplete-prompt').value =
    acPromptStored[STORAGE_KEYS.autocompletePrompt] || DEFAULT_AUTOCOMPLETE_PROMPT;

  // Perfiles personalizados
  await loadCustomProfiles();

  // Config de features
  await loadFeatureConfig();
}

async function saveConfig() {
  const provider = elProvider.value;
  const providerConfig = PROVIDERS[provider];
  const model = getSelectedModel();

  const baseUrl = elBaseUrl.value.trim().replace(/\/+$/, '');
  if (!baseUrl) {
    showSaveError(msg('error_enter_url'));
    return;
  }

  if (providerConfig.requiresKey && !elApiKey.value.trim()) {
    showSaveError(msg('error_requires_key_save', providerConfig.name || provider));
    return;
  }

  if (!model) {
    showSaveError(msg('error_select_model'));
    return;
  }

  const apiConfig = {
    provider,
    baseUrl,
    apiKey: elApiKey.value.trim(),
    model,
    temperature: parseFloat(document.getElementById('api-temperature').value) || API_DEFAULTS.temperature,
    maxTokens: parseInt(document.getElementById('api-max-tokens').value) || API_DEFAULTS.maxTokens
  };

  try {
    await browser.storage.local.set({ apiConfig });
    await browser.storage.local.set({ userPrompt: elPrompt.value });
    await saveFeatureConfig();
    await saveFallbackConfig();

    // Autocomplete prompt
    const acPromptValue = document.getElementById('autocomplete-prompt').value.trim();
    if (acPromptValue && acPromptValue !== DEFAULT_AUTOCOMPLETE_PROMPT) {
      await browser.storage.local.set({ [STORAGE_KEYS.autocompletePrompt]: acPromptValue });
    } else {
      await browser.storage.local.remove(STORAGE_KEYS.autocompletePrompt);
    }

    elSaveStatus.textContent = msg('success_saved');
    elSaveStatus.style.color = '#166534';
    elSaveStatus.classList.remove('hidden');
    setTimeout(() => elSaveStatus.classList.add('hidden'), UI_DEFAULTS.statusMessageTimeout);
  } catch (error) {
    showSaveError(msg('error_saving', error.message));
  }
}

function showSaveError(message) {
  elSaveStatus.textContent = message;
  elSaveStatus.style.color = '#991b1b';
  elSaveStatus.classList.remove('hidden');
  setTimeout(() => elSaveStatus.classList.add('hidden'), UI_DEFAULTS.errorMessageTimeout);
}

// --- Test de conexion ---

async function testConnection() {
  const model = getSelectedModel();
  const config = {
    provider: elProvider.value,
    baseUrl: elBaseUrl.value.trim().replace(/\/+$/, ''),
    apiKey: elApiKey.value.trim(),
    model
  };

  elTestResult.classList.remove('hidden', 'success', 'error');
  elTestResult.textContent = msg('loading_testing');

  try {
    const url = `${config.baseUrl}/chat/completions`;
    const headers = { 'Content-Type': 'application/json' };
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const start = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: 'Responde solo con: OK' },
          { role: 'user', content: 'Test' }
        ],
        max_tokens: 10
      }),
      signal: AbortSignal.timeout(API_DEFAULTS.testConnectionTimeout)
    });

    const latency = Date.now() - start;

    if (response.ok) {
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || '(sin respuesta)';
      elTestResult.className = 'test-result success';
      elTestResult.textContent = msg('success_connection', String(latency), config.model) + ` - ${reply.substring(0, 50)}`;
    } else {
      const errorBody = await response.text().catch(() => '');
      let errorMsg = `Error ${response.status}: ${response.statusText}`;
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed.error?.message) errorMsg = parsed.error.message;
      } catch (_) {}
      elTestResult.className = 'test-result error';
      elTestResult.textContent = errorMsg;
    }
  } catch (error) {
    elTestResult.className = 'test-result error';
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      elTestResult.textContent = msg('error_timeout');
    } else if (error instanceof TypeError) {
      elTestResult.textContent = msg('error_network');
    } else {
      elTestResult.textContent = error.message.substring(0, 200);
    }
  }
}

// --- Perfiles personalizados ---

async function loadCustomProfiles() {
  const stored = await browser.storage.local.get('promptProfiles');
  const profiles = stored.promptProfiles || [];
  renderProfiles(profiles);
}

function renderProfiles(profiles) {
  const container = document.getElementById('custom-profiles-list');
  container.innerHTML = '';

  if (profiles.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'field-hint';
    empty.textContent = msg('empty_no_profiles');
    container.appendChild(empty);
    return;
  }

  profiles.forEach(profile => {
    const item = document.createElement('div');
    item.className = 'profile-item';
    item.innerHTML = `
      <span class="profile-icon">${escapeHtml(profile.icon || UI_DEFAULTS.defaultProfileIcon)}</span>
      <span class="profile-name">${escapeHtml(profile.name)}</span>
      <div class="profile-actions">
        <button data-action="edit" data-id="${profile.id}">${msg('btn_edit')}</button>
        <button data-action="delete" data-id="${profile.id}" class="danger">${msg('btn_delete')}</button>
      </div>
    `;
    container.appendChild(item);
  });
}

// Event delegation para perfiles (se añade UNA sola vez)
document.getElementById('custom-profiles-list').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const id = btn.dataset.id;
  const action = btn.dataset.action;

  if (action === 'edit') {
    await editProfile(id);
  } else if (action === 'delete') {
    await deleteProfile(id);
  }
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function editProfile(id) {
  const stored = await browser.storage.local.get('promptProfiles');
  const profiles = stored.promptProfiles || [];
  const profile = profiles.find(p => p.id === id);
  if (!profile) return;

  document.getElementById('profile-name').value = profile.name;
  document.getElementById('profile-icon').value = profile.icon || '';
  document.getElementById('profile-prompt').value = profile.prompt;
  document.getElementById('profile-edit-id').value = id;
  document.getElementById('profile-editor-title').textContent = msg('opt_edit_prompt');

  const editor = document.getElementById('profile-editor');
  editor.open = true;
}

async function deleteProfile(id) {
  const stored = await browser.storage.local.get('promptProfiles');
  const profiles = stored.promptProfiles || [];
  const filtered = profiles.filter(p => p.id !== id);
  await browser.storage.local.set({ promptProfiles: filtered });
  renderProfiles(filtered);
}

async function saveProfile() {
  const name = document.getElementById('profile-name').value.trim();
  const icon = document.getElementById('profile-icon').value.trim() || UI_DEFAULTS.defaultProfileIcon;
  const prompt = document.getElementById('profile-prompt').value.trim();
  const editId = document.getElementById('profile-edit-id').value;

  if (!name) {
    showSaveError(msg('error_profile_name_required'));
    return;
  }
  if (!prompt) {
    showSaveError(msg('error_profile_prompt_required'));
    return;
  }

  const stored = await browser.storage.local.get('promptProfiles');
  const profiles = stored.promptProfiles || [];

  if (editId) {
    const index = profiles.findIndex(p => p.id === editId);
    if (index !== -1) {
      profiles[index] = { ...profiles[index], name, icon, prompt };
    }
  } else {
    profiles.push({
      id: 'custom_' + Date.now(),
      name,
      icon,
      prompt,
      category: 'custom'
    });
  }

  await browser.storage.local.set({ promptProfiles: profiles });
  renderProfiles(profiles);
  resetProfileEditor();
}

function resetProfileEditor() {
  document.getElementById('profile-name').value = '';
  document.getElementById('profile-icon').value = '';
  document.getElementById('profile-prompt').value = '';
  document.getElementById('profile-edit-id').value = '';
  document.getElementById('profile-editor-title').textContent = msg('opt_create_prompt');
  document.getElementById('profile-editor').open = false;
}

// --- Event Listeners ---

elProvider.addEventListener('change', onProviderChange);

document.getElementById('btn-save').addEventListener('click', saveConfig);
document.getElementById('btn-test').addEventListener('click', testConnection);
document.getElementById('btn-refresh-models').addEventListener('click', refreshModels);

document.getElementById('btn-toggle-key').addEventListener('click', () => {
  elApiKey.type = elApiKey.type === 'password' ? 'text' : 'password';
});

document.getElementById('btn-reset-prompt').addEventListener('click', () => {
  elPrompt.value = DEFAULT_PROMPT;
});

document.getElementById('btn-reset-autocomplete-prompt').addEventListener('click', () => {
  document.getElementById('autocomplete-prompt').value = DEFAULT_AUTOCOMPLETE_PROMPT;
});

document.getElementById('btn-save-profile').addEventListener('click', saveProfile);
document.getElementById('btn-cancel-profile').addEventListener('click', resetProfileEditor);

// Toggle de autocompletado: mostrar/ocultar opciones extra
document.getElementById('feat-autocomplete').addEventListener('change', (e) => {
  document.getElementById('autocomplete-options').classList.toggle('hidden', !e.target.checked);
});

// --- Feature Config ---

async function loadFeatureConfig() {
  const stored = await browser.storage.local.get('featureConfig');
  const config = stored.featureConfig || {};

  document.getElementById('feat-autocomplete').checked = config.autocomplete !== false;
  document.getElementById('feat-autocomplete-delay').value = config.autocompleteDelay || 2000;
  document.getElementById('feat-tone').checked = config.tone !== false;
  document.getElementById('feat-length').checked = config.length !== false;
  document.getElementById('feat-translate').checked = config.translate !== false;
  document.getElementById('feat-generate').checked = config.generate !== false;
  document.getElementById('feat-analysis').checked = config.analysis !== false;
  document.getElementById('feat-learning').checked = config.learningMode !== false;

  document.getElementById('autocomplete-options').classList.toggle(
    'hidden',
    config.autocomplete === false
  );
}

async function saveFeatureConfig() {
  const featureConfig = {
    autocomplete: document.getElementById('feat-autocomplete').checked,
    autocompleteDelay: parseInt(document.getElementById('feat-autocomplete-delay').value) || 2000,
    tone: document.getElementById('feat-tone').checked,
    length: document.getElementById('feat-length').checked,
    translate: document.getElementById('feat-translate').checked,
    generate: document.getElementById('feat-generate').checked,
    analysis: document.getElementById('feat-analysis').checked,
    learningMode: document.getElementById('feat-learning').checked
  };

  await browser.storage.local.set({ featureConfig });
}

// --- Plantillas ---

async function loadTemplates() {
  const stored = await browser.storage.local.get('emailTemplates');
  const templates = stored.emailTemplates || [];
  renderTemplates(templates);
}

function renderTemplates(templates) {
  const container = document.getElementById('templates-list');
  container.innerHTML = '';

  if (templates.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'field-hint';
    empty.textContent = msg('empty_no_templates');
    container.appendChild(empty);
    return;
  }

  templates.forEach(tpl => {
    const item = document.createElement('div');
    item.className = 'profile-item';
    item.innerHTML = `
      <span class="profile-icon">📄</span>
      <span class="profile-name">${escapeHtml(tpl.name)}</span>
      <div class="profile-actions">
        <button data-tpl-action="edit" data-id="${tpl.id}">${msg('btn_edit')}</button>
        <button data-tpl-action="delete" data-id="${tpl.id}" class="danger">${msg('btn_delete')}</button>
      </div>
    `;
    container.appendChild(item);
  });
}

document.getElementById('templates-list').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-tpl-action]');
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.dataset.tplAction === 'edit') {
    const stored = await browser.storage.local.get('emailTemplates');
    const tpl = (stored.emailTemplates || []).find(t => t.id === id);
    if (!tpl) return;
    document.getElementById('template-name').value = tpl.name;
    document.getElementById('template-content').value = tpl.content;
    document.getElementById('template-edit-id').value = id;
    document.getElementById('template-editor-title').textContent = msg('opt_edit_template');
    document.getElementById('template-editor').open = true;
  } else if (btn.dataset.tplAction === 'delete') {
    const stored = await browser.storage.local.get('emailTemplates');
    const filtered = (stored.emailTemplates || []).filter(t => t.id !== id);
    await browser.storage.local.set({ emailTemplates: filtered });
    renderTemplates(filtered);
  }
});

document.getElementById('btn-save-template').addEventListener('click', async () => {
  const name = document.getElementById('template-name').value.trim();
  const content = document.getElementById('template-content').value.trim();
  const editId = document.getElementById('template-edit-id').value;

  if (!name || !content) {
    showSaveError(msg('error_template_required'));
    return;
  }

  const stored = await browser.storage.local.get('emailTemplates');
  const templates = stored.emailTemplates || [];

  if (editId) {
    const idx = templates.findIndex(t => t.id === editId);
    if (idx !== -1) templates[idx] = { ...templates[idx], name, content };
  } else {
    templates.push({ id: 'tpl_' + Date.now(), name, content });
  }

  await browser.storage.local.set({ emailTemplates: templates });
  renderTemplates(templates);
  document.getElementById('template-name').value = '';
  document.getElementById('template-content').value = '';
  document.getElementById('template-edit-id').value = '';
  document.getElementById('template-editor-title').textContent = msg('opt_create_template');
  document.getElementById('template-editor').open = false;
});

document.getElementById('btn-cancel-template').addEventListener('click', () => {
  document.getElementById('template-name').value = '';
  document.getElementById('template-content').value = '';
  document.getElementById('template-edit-id').value = '';
  document.getElementById('template-editor').open = false;
});

// --- Snippets CRUD ---

async function loadSnippets() {
  const stored = await browser.storage.local.get('snippets');
  renderSnippets(stored.snippets || []);
}

function renderSnippets(snippets) {
  const container = document.getElementById('snippets-list');
  container.innerHTML = '';
  if (snippets.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'field-hint';
    empty.textContent = msg('empty_no_templates');
    container.appendChild(empty);
    return;
  }
  snippets.forEach(s => {
    const item = document.createElement('div');
    item.className = 'profile-item';
    item.innerHTML = `
      <span class="profile-icon">📎</span>
      <span class="profile-name">${escapeHtml(s.name)}</span>
      <div class="profile-actions">
        <button data-snip-action="edit" data-id="${s.id}">${msg('btn_edit')}</button>
        <button data-snip-action="delete" data-id="${s.id}" class="danger">${msg('btn_delete')}</button>
      </div>
    `;
    container.appendChild(item);
  });
}

document.getElementById('snippets-list').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-snip-action]');
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.dataset.snipAction === 'edit') {
    const stored = await browser.storage.local.get('snippets');
    const s = (stored.snippets || []).find(x => x.id === id);
    if (!s) return;
    document.getElementById('snippet-name').value = s.name;
    document.getElementById('snippet-content').value = s.content;
    document.getElementById('snippet-edit-id').value = id;
    document.getElementById('snippet-editor').open = true;
  } else if (btn.dataset.snipAction === 'delete') {
    const stored = await browser.storage.local.get('snippets');
    const filtered = (stored.snippets || []).filter(x => x.id !== id);
    await browser.storage.local.set({ snippets: filtered });
    renderSnippets(filtered);
  }
});

document.getElementById('btn-save-snippet').addEventListener('click', async () => {
  const name = document.getElementById('snippet-name').value.trim();
  const content = document.getElementById('snippet-content').value.trim();
  const editId = document.getElementById('snippet-edit-id').value;
  if (!name || !content) { showSaveError(msg('error_template_required')); return; }

  const stored = await browser.storage.local.get('snippets');
  const snippets = stored.snippets || [];
  if (editId) {
    const idx = snippets.findIndex(x => x.id === editId);
    if (idx !== -1) snippets[idx] = { ...snippets[idx], name, content };
  } else {
    snippets.push({ id: 'snip_' + Date.now(), name, content });
  }
  await browser.storage.local.set({ snippets });
  renderSnippets(snippets);
  document.getElementById('snippet-name').value = '';
  document.getElementById('snippet-content').value = '';
  document.getElementById('snippet-edit-id').value = '';
  document.getElementById('snippet-editor').open = false;
});

document.getElementById('btn-cancel-snippet').addEventListener('click', () => {
  document.getElementById('snippet-name').value = '';
  document.getElementById('snippet-content').value = '';
  document.getElementById('snippet-edit-id').value = '';
  document.getElementById('snippet-editor').open = false;
});

// --- Contexto por cuenta ---

async function loadAccountContexts() {
  try {
    const accounts = await browser.accounts.list();
    const stored = await browser.storage.local.get('accountContexts');
    const contexts = stored.accountContexts || {};
    const container = document.getElementById('account-contexts-list');
    container.innerHTML = '';

    if (!accounts || accounts.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'field-hint';
      empty.textContent = msg('empty_no_profiles');
      container.appendChild(empty);
      return;
    }

    accounts.forEach(account => {
      if (account.type === 'none') return; // Skip local folders
      const ctx = contexts[account.id] || {};
      const div = document.createElement('div');
      div.className = 'profile-item';
      div.style.flexDirection = 'column';
      div.style.alignItems = 'stretch';
      div.style.gap = '6px';
      div.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;">
          <strong>${escapeHtml(account.name)}</strong>
          <small style="color:#6b7280;">${escapeHtml(account.identities?.[0]?.email || '')}</small>
        </div>
        <div style="display:flex;gap:6px;">
          <select data-account="${account.id}" data-field="tone" style="flex:1;padding:4px;font-size:12px;border:1px solid #d1d5db;border-radius:4px;">
            <option value="">${msg('ui_tone_no_change')}</option>
            <option value="formal" ${ctx.tone === 'formal' ? 'selected' : ''}>${msg('ui_tone_formal')}</option>
            <option value="informal" ${ctx.tone === 'informal' ? 'selected' : ''}>${msg('ui_tone_informal')}</option>
            <option value="amigable" ${ctx.tone === 'amigable' ? 'selected' : ''}>${msg('ui_tone_friendly')}</option>
            <option value="directo" ${ctx.tone === 'directo' ? 'selected' : ''}>${msg('ui_tone_direct')}</option>
            <option value="diplomatico" ${ctx.tone === 'diplomatico' ? 'selected' : ''}>${msg('ui_tone_diplomatic')}</option>
          </select>
          <select data-account="${account.id}" data-field="lang" style="flex:1;padding:4px;font-size:12px;border:1px solid #d1d5db;border-radius:4px;">
            <option value="">Auto</option>
            ${Object.entries(LANGUAGE_NAMES).map(([k, v]) => `<option value="${k}" ${ctx.lang === k ? 'selected' : ''}>${v}</option>`).join('')}
          </select>
        </div>
      `;
      container.appendChild(div);
    });

    // Auto-save on change
    container.addEventListener('change', async (e) => {
      const sel = e.target;
      const accountId = sel.dataset.account;
      const field = sel.dataset.field;
      if (!accountId || !field) return;
      const stored2 = await browser.storage.local.get('accountContexts');
      const ctxs = stored2.accountContexts || {};
      if (!ctxs[accountId]) ctxs[accountId] = {};
      ctxs[accountId][field] = sel.value;
      await browser.storage.local.set({ accountContexts: ctxs });
    });
  } catch (_) {
    // accounts API might not be available
    const container = document.getElementById('account-contexts-list');
    container.innerHTML = `<p class="field-hint">${msg('error_network')}</p>`;
  }
}

document.getElementById('btn-refresh-accounts').addEventListener('click', loadAccountContexts);

// --- Fallback Provider ---

document.getElementById('fallback-enabled').addEventListener('change', (e) => {
  document.getElementById('fallback-config').classList.toggle('hidden', !e.target.checked);
});

document.getElementById('fallback-provider').addEventListener('change', () => {
  const provider = document.getElementById('fallback-provider').value;
  const config = PROVIDERS[provider] || {};
  document.getElementById('fallback-url').value = config.baseUrl || '';
  document.getElementById('field-fallback-key').classList.toggle('hidden', !config.requiresKey);
  if (config.defaultModels?.[0]) {
    document.getElementById('fallback-model').value = config.defaultModels[0];
  }
});

async function loadFallbackConfig() {
  const stored = await browser.storage.local.get('fallbackProviders');
  const fallbacks = stored.fallbackProviders || [];
  const enabled = fallbacks.length > 0;
  const fb = fallbacks[0] || {};

  document.getElementById('fallback-enabled').checked = enabled;
  document.getElementById('fallback-config').classList.toggle('hidden', !enabled);

  if (fb.provider) document.getElementById('fallback-provider').value = fb.provider;
  if (fb.baseUrl) document.getElementById('fallback-url').value = fb.baseUrl;
  if (fb.apiKey) document.getElementById('fallback-key').value = fb.apiKey;
  if (fb.model) document.getElementById('fallback-model').value = fb.model;

  const provConfig = PROVIDERS[fb.provider || 'groq'] || {};
  document.getElementById('field-fallback-key').classList.toggle('hidden', !provConfig.requiresKey);
}

async function saveFallbackConfig() {
  const enabled = document.getElementById('fallback-enabled').checked;

  if (!enabled) {
    await browser.storage.local.set({ fallbackProviders: [] });
    return;
  }

  const provider = document.getElementById('fallback-provider').value;
  const fallbackConfig = {
    provider,
    baseUrl: document.getElementById('fallback-url').value.trim().replace(/\/+$/, ''),
    apiKey: document.getElementById('fallback-key').value.trim(),
    model: document.getElementById('fallback-model').value.trim()
  };

  if (!fallbackConfig.baseUrl || !fallbackConfig.model) {
    showSaveError(msg('error_fallback_required'));
    return;
  }

  await browser.storage.local.set({ fallbackProviders: [fallbackConfig] });
}

// --- Export/Import ---

document.getElementById('btn-export').addEventListener('click', async () => {
  const statusEl = document.getElementById('export-import-status');
  statusEl.textContent = msg('loading_exporting');
  statusEl.className = 'test-result';
  statusEl.classList.remove('hidden');

  const result = await browser.runtime.sendMessage({ action: 'exportConfig' });
  if (result.success) {
    const blob = new Blob([result.configData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `easymailai-config-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    statusEl.className = 'test-result success';
    statusEl.textContent = msg('success_exported');
  } else {
    statusEl.className = 'test-result error';
    statusEl.textContent = result.error;
  }
  setTimeout(() => statusEl.classList.add('hidden'), UI_DEFAULTS.errorMessageTimeout);
});

document.getElementById('btn-import').addEventListener('click', () => {
  document.getElementById('import-file').click();
});

document.getElementById('import-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const statusEl = document.getElementById('export-import-status');
  statusEl.textContent = msg('loading_importing');
  statusEl.className = 'test-result';
  statusEl.classList.remove('hidden');

  try {
    const text = await file.text();
    const result = await browser.runtime.sendMessage({ action: 'importConfig', configData: text });
    if (result.success) {
      statusEl.className = 'test-result success';
      statusEl.textContent = result.message;
      // Recargar pagina para mostrar config importada
      setTimeout(() => location.reload(), 2000);
    } else {
      statusEl.className = 'test-result error';
      statusEl.textContent = result.error;
    }
  } catch (error) {
    statusEl.className = 'test-result error';
    statusEl.textContent = `Error: ${error.message}`;
  }

  e.target.value = '';
  setTimeout(() => statusEl.classList.add('hidden'), UI_DEFAULTS.errorMessageTimeout);
});

// --- Historial ---

async function loadHistory() {
  const result = await browser.runtime.sendMessage({ action: 'getHistory' });
  const container = document.getElementById('history-list');
  const history = result?.history || [];

  if (history.length === 0) {
    container.innerHTML = '<p class="field-hint">${msg('empty_no_history')}</p>';
    return;
  }

  container.innerHTML = '';
  history.slice(0, 20).forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-item';
    const date = new Date(item.timestamp);
    const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    div.innerHTML = `
      <span class="history-date">${dateStr}</span>
      <span class="history-action">${escapeHtml(item.action)}</span>
      <span class="history-preview">${escapeHtml(item.originalPreview)}...</span>
    `;
    container.appendChild(div);
  });
}

document.getElementById('btn-clear-history').addEventListener('click', async () => {
  await browser.storage.local.set({ improvementHistory: [] });
  document.getElementById('history-list').innerHTML = '<p class="field-hint">${msg('empty_no_history')}</p>';
});

// Cargar al inicio (applyI18n se ejecuta automaticamente desde i18n-helper.js)
loadConfig();
loadFallbackConfig();
loadTemplates();
loadSnippets();
loadAccountContexts();
loadHistory();

// Version dinamica desde manifest
const manifest = browser.runtime.getManifest();
document.getElementById('version-text').textContent = `v${manifest.version}`;
