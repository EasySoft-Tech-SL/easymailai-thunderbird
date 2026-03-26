/**
 * EasyMailAI - Constantes compartidas
 * Fuente unica de verdad para proveedores, prompts, limites y configuracion
 * Desarrollado por Easysoft Tech S.L. (https://easysoft.es)
 */

// --- Proveedores ---

const PROVIDERS = {
  groq: {
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModels: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    requiresKey: true
  },
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    requiresKey: true
  },
  ollama: {
    name: 'Ollama (Local)',
    baseUrl: 'http://localhost:11434/v1',
    defaultModels: [],
    requiresKey: false
  },
  mistral: {
    name: 'Mistral',
    baseUrl: 'https://api.mistral.ai/v1',
    defaultModels: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'],
    requiresKey: true
  },
  custom: {
    name: 'Custom',
    baseUrl: '',
    defaultModels: [],
    requiresKey: false
  }
};

// --- Limites ---

const LIMITS = {
  MAX_BODY_CHARS: 50000,
  MAX_COMPOSE_STATES: 50,
  MAX_IMPROVEMENT_HISTORY: 50,
  MAX_QUOTED_CONTENT_LENGTH: 3000,
  MAX_REPLY_INSTRUCTIONS_LENGTH: 500,
  MAX_SUBJECT_GENERATION_LENGTH: 2000,
  MAX_ANALYSIS_LENGTH: 3000,
  MAX_SUMMARIZE_LENGTH: 5000,
  MAX_ADAPT_THREAD_LENGTH: 2000,
  MAX_WRITING_STYLE_SAMPLE_LENGTH: 1000,
  MAX_WRITING_STYLE_SAMPLES: 10,
  MAX_AUTOCOMPLETE_CONTEXT_LENGTH: 500,
  MIN_AUTOCOMPLETE_TEXT_LENGTH: 10,
  MIN_IMPROVE_TEXT_LENGTH: 3,
  HISTORY_DISPLAY_LIMIT: 20
};

// --- Defaults API ---

const API_DEFAULTS = {
  temperature: 0.7,
  maxTokens: 4096,
  testConnectionTimeout: 15000,
  fetchModelsTimeout: 10000,
  modelsCacheDuration: 3600000, // 1 hora
  autocompleteDebounce: 2000
};

// --- Defaults UI ---

const UI_DEFAULTS = {
  statusMessageTimeout: 3000,
  errorMessageTimeout: 5000,
  defaultProfileIcon: '📌'
};

// --- Storage Keys centralizados ---

const STORAGE_KEYS = {
  apiConfig: 'apiConfig',
  fallbackProviders: 'fallbackProviders',
  featureConfig: 'featureConfig',
  userPrompt: 'userPrompt',
  promptProfiles: 'promptProfiles',
  activeProfileId: 'activeProfileId',
  emailTemplates: 'emailTemplates',
  writingStyle: 'writingStyle',
  improvementHistory: 'improvementHistory',
  autocompletePrompt: 'autocompletePrompt',
  snippets: 'snippets',
  accountContexts: 'accountContexts'
};

// --- Prompts del sistema (configurables) ---

const DEFAULT_PROMPT = `Eres un asistente experto en redaccion de correos electronicos profesionales.
Tu tarea es mejorar el texto del correo que te envie el usuario.

Reglas:
- Mejora la gramatica, ortografia, puntuacion y estilo
- Mantén el significado y la intencion original del mensaje
- Usa un tono profesional pero natural
- No agregues informacion que no este en el original
- No incluyas saludos ni despedidas si el original no los tiene
- Responde SOLO con el texto mejorado, sin explicaciones ni comentarios
- Mantén el mismo idioma del texto original
- Si el texto ya esta bien escrito, devuelvelo igual o con cambios minimos`;

const DEFAULT_AUTOCOMPLETE_PROMPT = `Eres un asistente de escritura de correos. El usuario esta escribiendo un correo electronico.
Basandote en el texto que lleva escrito, sugiere UNA continuacion corta y natural (1-2 frases maximo).

Reglas:
- Responde SOLO con la continuacion sugerida, sin el texto original
- La continuacion debe fluir naturalmente con lo ya escrito
- Mantén el mismo idioma, tono y estilo del texto
- Se breve: maximo 1-2 frases cortas
- No incluyas saludos ni despedidas a menos que sea el momento natural
- Si el texto parece completo, responde con una cadena vacia`;

const DEFAULT_TEMPLATE_FILL_PROMPT = `Rellena los campos marcados con {nombre} en la siguiente plantilla de correo.
Usa contenido apropiado y profesional. Responde SOLO con la plantilla completada:`;

// --- Nombres de tonos e idiomas ---

const TONE_NAMES = {
  formal: 'formal y profesional',
  informal: 'informal y relajado',
  amigable: 'amigable y cercano',
  directo: 'directo y conciso',
  diplomatico: 'diplomatico y cuidadoso'
};

const LANGUAGE_NAMES = {
  es: 'español',
  en: 'inglés',
  fr: 'francés',
  de: 'alemán',
  it: 'italiano',
  pt: 'portugués',
  ca: 'catalán',
  zh: 'chino',
  ja: 'japonés',
  ar: 'árabe'
};
