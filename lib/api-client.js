/**
 * API Client - Compatible con cualquier API OpenAI-compatible
 * Soporta: Groq, OpenAI, Ollama, Mistral, Custom
 * PROVIDERS y DEFAULT_PROMPT se cargan desde lib/constants.js
 */

class ApiClient {
  /**
   * Llama a la API de chat completions
   * @param {object} config - {provider, baseUrl, apiKey, model}
   * @param {string} systemPrompt - Instrucciones del sistema
   * @param {string} userMessage - Texto del usuario a procesar
   * @param {AbortSignal} [signal] - Para cancelar la peticion
   * @returns {Promise<string>} Texto de respuesta
   */
  static async complete(config, systemPrompt, userMessage, signal) {
    const url = `${config.baseUrl.replace(/\/+$/, '')}/chat/completions`;

    const headers = {
      'Content-Type': 'application/json'
    };

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const body = {
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: config.temperature ?? API_DEFAULTS.temperature,
      max_tokens: config.maxTokens ?? API_DEFAULTS.maxTokens
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      let errorMsg = `Error ${response.status}: ${response.statusText}`;
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed.error?.message) {
          errorMsg = parsed.error.message;
        }
      } catch (e) {
        if (errorBody) errorMsg += ` - ${errorBody.substring(0, 200)}`;
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error(msg('error_unexpected_api'));
    }

    const content = data.choices[0].message.content.trim();
    if (!content) {
      throw new Error(msg('error_empty_api'));
    }

    return content;
  }

  /**
   * Test de conexion con el proveedor
   * @param {object} config - {provider, baseUrl, apiKey, model}
   * @returns {Promise<{success: boolean, message: string, latencyMs: number}>}
   */
  static async testConnection(config) {
    const start = Date.now();
    try {
      const result = await this.complete(
        config,
        'Responde solo con: OK',
        'Test de conexion. Responde solo OK.',
        AbortSignal.timeout(API_DEFAULTS.testConnectionTimeout)
      );
      const latencyMs = Date.now() - start;
      return {
        success: true,
        message: `Conexion exitosa (${latencyMs}ms). Respuesta: ${result.substring(0, 50)}`,
        latencyMs
      };
    } catch (error) {
      const latencyMs = Date.now() - start;
      return {
        success: false,
        message: error.message,
        latencyMs
      };
    }
  }

  /**
   * Llama con fallback a proveedores alternativos si el principal falla
   * @param {string} systemPrompt
   * @param {string} userMessage
   * @param {AbortSignal} [signal]
   * @returns {Promise<string>}
   */
  static async completeWithFallback(systemPrompt, userMessage, signal) {
    const config = await this.getConfig();
    const fallbackConfigs = await this.getFallbackConfigs();
    const allConfigs = [config, ...fallbackConfigs];

    let lastError = null;
    for (const cfg of allConfigs) {
      if (!cfg.baseUrl || !cfg.model) continue;
      try {
        return await this.complete(cfg, systemPrompt, userMessage, signal);
      } catch (error) {
        if (error.name === 'AbortError') throw error;
        lastError = error;
      }
    }

    throw lastError || new Error('Todos los proveedores fallaron.');
  }

  /**
   * Obtiene la lista de proveedores fallback
   * @returns {Promise<Array>}
   */
  static async getFallbackConfigs() {
    const stored = await browser.storage.local.get('fallbackProviders');
    return stored.fallbackProviders || [];
  }

  /**
   * Guarda la lista de proveedores fallback
   * @param {Array} configs
   */
  static async saveFallbackConfigs(configs) {
    await browser.storage.local.set({ fallbackProviders: configs });
  }

  /**
   * Obtiene la config guardada del storage
   * @returns {Promise<object>}
   */
  static async getConfig() {
    const defaults = {
      provider: 'groq',
      baseUrl: PROVIDERS.groq.baseUrl,
      apiKey: '',
      model: PROVIDERS.groq.defaultModels[0] || ''
    };

    const stored = await browser.storage.local.get('apiConfig');
    return { ...defaults, ...(stored.apiConfig || {}) };
  }

  /**
   * Guarda la config en el storage
   * @param {object} config
   */
  static async saveConfig(config) {
    await browser.storage.local.set({ apiConfig: config });
  }

  /**
   * Obtiene la lista de modelos del proveedor via GET /v1/models
   * @param {object} config - {baseUrl, apiKey}
   * @returns {Promise<string[]>} Lista de IDs de modelos
   */
  static async fetchModels(config) {
    const url = `${config.baseUrl.replace(/\/+$/, '')}/models`;

    const headers = {};
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(API_DEFAULTS.fetchModelsTimeout)
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Formato OpenAI: { data: [{ id: "model-name", ... }, ...] }
    if (data.data && Array.isArray(data.data)) {
      return data.data
        .map(m => m.id)
        .sort((a, b) => a.localeCompare(b));
    }

    // Formato Ollama legacy: { models: [{ name: "model-name", ... }, ...] }
    if (data.models && Array.isArray(data.models)) {
      return data.models
        .map(m => m.name || m.model)
        .sort((a, b) => a.localeCompare(b));
    }

    throw new Error('Formato de respuesta no reconocido.');
  }

  /**
   * Obtiene modelos con cache
   * @param {object} config - {provider, baseUrl, apiKey}
   * @param {boolean} [forceRefresh=false]
   * @returns {Promise<string[]>}
   */
  static async getModels(config, forceRefresh = false) {
    const cacheKey = `models_${config.provider}`;

    if (!forceRefresh) {
      const cached = await browser.storage.local.get(cacheKey);
      if (cached[cacheKey]?.models?.length > 0) {
        const age = Date.now() - (cached[cacheKey].timestamp || 0);
        // Cache valida por 1 hora
        if (age < API_DEFAULTS.modelsCacheDuration) {
          return cached[cacheKey].models;
        }
      }
    }

    try {
      const models = await this.fetchModels(config);
      // Guardar en cache
      await browser.storage.local.set({
        [cacheKey]: { models, timestamp: Date.now() }
      });
      return models;
    } catch (error) {
      // Fallback a lista hardcodeada
      const provider = PROVIDERS[config.provider];
      if (provider?.defaultModels?.length > 0) {
        return provider.defaultModels;
      }
      throw error;
    }
  }
}
