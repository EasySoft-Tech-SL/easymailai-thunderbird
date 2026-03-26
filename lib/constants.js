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

const DEFAULT_PROMPT = `You are an expert email editor. Your task is to improve the email text provided by the user.

Rules:
- Fix all grammar, spelling, punctuation and style errors
- Improve sentence structure and readability
- Preserve the exact meaning, intent and information of the original
- Match the formality level of the original (don't make casual emails formal or vice versa)
- Keep the same language as the original text
- If the text includes a greeting or closing, keep them. If it doesn't, don't add them
- Preserve any names, dates, numbers, URLs and technical terms exactly
- Do NOT add new information, opinions or content not present in the original
- If the original text is already well-written, return it with minimal changes
- Respond with ONLY the improved text. No explanations, no comments, no preamble`;

const DEFAULT_AUTOCOMPLETE_PROMPT = `You are an email writing assistant providing inline text completions.
The user is actively composing an email and has paused. Based on what they've written so far, suggest a natural continuation.

Rules:
- Respond with ONLY the suggested continuation text (1-2 short sentences max)
- Do NOT repeat or include any of the existing text
- The continuation must flow naturally from the last word/sentence
- Match the language, tone, formality level and writing style of the existing text
- Be concise and practical - suggest the most likely next thought
- If the email appears to be a reply, consider typical reply patterns
- If the text seems complete (has a closing/signature), respond with an empty string
- Do NOT add greetings or closings unless it's clearly the natural next step
- Never explain what you're doing - just output the continuation text`;

const DEFAULT_TEMPLATE_FILL_PROMPT = `Fill the fields marked with {name} in the following email template.
Use REAL data from the context provided (recipient names, subject, dates, etc).
NEVER invent names, companies or data. Use only what is available in the context.
If a field cannot be determined from the context, leave the {placeholder} unchanged.
Respond with ONLY the completed template, no explanations:`;

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
