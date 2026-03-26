/**
 * Prompt Manager - Gestion de prompts del sistema
 * Biblioteca predefinida + perfiles personalizados + variables
 * DEFAULT_PROMPT y PROVIDERS se cargan desde lib/constants.js
 */

// Storage keys centralizados en constants.js via STORAGE_KEYS

/**
 * Prompts predefinidos de fabrica
 * Cada uno tiene: id, name, icon, prompt, category
 */
const BUILTIN_PROMPTS = [
  {
    id: 'improve',
    name: 'Mejorar redaccion',
    icon: '✨',
    category: 'general',
    prompt: DEFAULT_PROMPT
  },
  {
    id: 'formalize',
    name: 'Formalizar',
    icon: '👔',
    category: 'tone',
    prompt: `Reescribe el siguiente correo con un tono formal y profesional.
Reglas:
- Usa un registro formal y cortés
- Mantén el significado original
- Incluye formulas de cortesia apropiadas si faltan
- Responde SOLO con el texto mejorado, sin explicaciones
- Mantén el mismo idioma del texto original`
  },
  {
    id: 'simplify',
    name: 'Simplificar',
    icon: '💡',
    category: 'tone',
    prompt: `Simplifica el siguiente correo para que sea mas claro y facil de entender.
Reglas:
- Usa frases cortas y vocabulario sencillo
- Elimina redundancias y lenguaje innecesario
- Mantén toda la informacion importante
- Responde SOLO con el texto simplificado, sin explicaciones
- Mantén el mismo idioma del texto original`
  },
  {
    id: 'shorten',
    name: 'Acortar',
    icon: '✂️',
    category: 'length',
    prompt: `Acorta el siguiente correo manteniendo los puntos clave.
Reglas:
- Reduce la longitud al minimo necesario
- Mantén los datos importantes (fechas, nombres, cifras)
- Elimina repeticiones, muletillas y frases de relleno
- Responde SOLO con el texto acortado, sin explicaciones
- Mantén el mismo idioma del texto original`
  },
  {
    id: 'expand',
    name: 'Expandir',
    icon: '📝',
    category: 'length',
    prompt: `Expande y desarrolla el siguiente correo para que sea mas completo y detallado.
Reglas:
- Añade contexto y detalle donde sea apropiado
- Mantén un tono profesional y natural
- No inventes informacion que no se pueda inferir del original
- Responde SOLO con el texto expandido, sin explicaciones
- Mantén el mismo idioma del texto original`
  },
  {
    id: 'grammar',
    name: 'Solo gramatica',
    icon: '📖',
    category: 'general',
    prompt: `Corrige SOLO los errores de gramatica, ortografia y puntuacion del siguiente correo.
Reglas:
- NO cambies el estilo, tono ni estructura del texto
- Solo corrige errores gramaticales, ortograficos y de puntuacion
- Mantén las mismas palabras y expresiones del autor
- Responde SOLO con el texto corregido, sin explicaciones
- Mantén el mismo idioma del texto original`
  },
  {
    id: 'friendly',
    name: 'Tono amigable',
    icon: '😊',
    category: 'tone',
    prompt: `Reescribe el siguiente correo con un tono amigable y cercano.
Reglas:
- Usa un tono calido pero profesional
- Mantén el significado original
- Responde SOLO con el texto mejorado, sin explicaciones
- Mantén el mismo idioma del texto original`
  },
  {
    id: 'diplomatic',
    name: 'Tono diplomatico',
    icon: '🤝',
    category: 'tone',
    prompt: `Reescribe el siguiente correo con un tono diplomatico y cuidadoso.
Reglas:
- Suaviza expresiones directas o agresivas
- Usa lenguaje diplomatico y conciliador
- Mantén el mensaje y la intencion original
- Responde SOLO con el texto mejorado, sin explicaciones
- Mantén el mismo idioma del texto original`
  },
  {
    id: 'complete',
    name: 'Completar texto',
    icon: '🔮',
    category: 'generate',
    prompt: `El usuario ha empezado a escribir un correo pero no lo ha terminado. Completa el correo de forma natural y coherente.
Reglas:
- Continua donde el usuario dejo de escribir
- Mantén el mismo tono y estilo que el texto existente
- No repitas lo que ya esta escrito
- Genera una conclusion natural para el correo
- Responde con el texto COMPLETO (lo existente + tu continuacion), sin explicaciones
- Mantén el mismo idioma del texto original`
  },
  {
    id: 'suggest_next',
    name: 'Sugerir parrafo',
    icon: '💭',
    category: 'generate',
    prompt: `Basandote en el correo que el usuario lleva escrito, sugiere el siguiente parrafo.
Reglas:
- El parrafo debe fluir naturalmente con lo ya escrito
- Mantén el mismo tono y estilo
- Responde SOLO con el parrafo sugerido (sin el texto original), sin explicaciones
- Mantén el mismo idioma del texto original`
  },
  {
    id: 'reply_generate',
    name: 'Generar respuesta',
    icon: '↩️',
    category: 'generate',
    prompt: `El usuario necesita responder a un correo que ha recibido. Te proporcionara el correo original y opcionalmente instrucciones.
Reglas:
- Genera una respuesta profesional y apropiada al correo recibido
- Si el usuario da instrucciones (ej: "acepta", "rechaza", "pide mas info"), sigue esas instrucciones
- Si no hay instrucciones, genera una respuesta generica y educada
- Mantén un tono profesional y natural
- Responde SOLO con el texto de la respuesta, sin explicaciones
- Usa el mismo idioma del correo original`
  },
  {
    id: 'from_bullets',
    name: 'Desde notas/puntos',
    icon: '📋',
    category: 'generate',
    prompt: `El usuario ha escrito notas, puntos clave o ideas sueltas. Convierte eso en un correo profesional y bien redactado.
Reglas:
- Transforma los puntos/notas en un correo coherente y fluido
- Incluye un saludo y despedida apropiados si el usuario no los ha puesto
- Mantén toda la informacion de los puntos originales
- Usa un tono profesional pero natural
- Responde SOLO con el correo generado, sin explicaciones
- Detecta el idioma de las notas y usa el mismo`
  },
  {
    id: 'generate_subject',
    name: 'Generar asunto',
    icon: '📌',
    category: 'generate',
    prompt: `Genera lineas de asunto para el correo electronico que te proporcione el usuario.
Reglas:
- Cada asunto debe ser conciso (maximo 60 caracteres)
- Debe reflejar claramente el contenido del correo
- Genera exactamente 3 opciones, CADA UNA EN UNA LINEA SEPARADA
- No numeres ni pongas guiones: solo el texto del asunto en cada linea
- Usa el mismo idioma del correo
- Responde SOLO con las 3 lineas de asunto, sin explicaciones`
  },
  // --- Fase 2.0: Analisis y avanzado ---
  {
    id: 'analyze_tone',
    name: 'Analizar tono',
    icon: '🎭',
    category: 'analysis',
    prompt: `Analiza el tono del siguiente correo electronico que el usuario esta a punto de enviar.
Responde con un analisis breve en este formato:
TONO: [formal/informal/agresivo/pasivo-agresivo/amigable/neutro/urgente]
IMPRESION: [1-2 frases sobre como se percibira el correo]
SUGERENCIAS: [1-2 mejoras concretas si el tono es inapropiado, o "Ninguna" si esta bien]

Responde en el mismo idioma del correo.`
  },
  {
    id: 'analyze_sentiment',
    name: 'Sentimiento recibido',
    icon: '🔍',
    category: 'analysis',
    prompt: `Analiza el sentimiento y tono del siguiente correo que el usuario ha RECIBIDO (no escrito).
Responde con un analisis breve en este formato:
SENTIMIENTO: [positivo/negativo/neutro/urgente/molesto/entusiasta]
TONO: [formal/informal/directo/agresivo/conciliador]
PUNTOS CLAVE: [lista de 2-3 puntos principales del correo]
RECOMENDACION: [como deberia responder el usuario]

Responde en el mismo idioma del correo.`
  },
  {
    id: 'detect_ambiguity',
    name: 'Detectar ambiguedad',
    icon: '⚠️',
    category: 'analysis',
    prompt: `Revisa el siguiente correo y detecta frases ambiguas o que podrian malinterpretarse.
Para cada frase problematica, indica:
- La frase original
- Por que podria malinterpretarse
- Una alternativa mas clara

Si no hay ambiguedades, responde: "No se detectaron ambiguedades significativas."
Responde en el mismo idioma del correo.`
  },
  {
    id: 'pre_send_check',
    name: 'Checklist pre-envio',
    icon: '✅',
    category: 'analysis',
    prompt: `Revisa el siguiente correo antes de enviarlo y realiza un checklist:
- [ ] Tiene saludo apropiado
- [ ] Tiene despedida apropiada
- [ ] El tono es coherente y profesional
- [ ] No tiene errores gramaticales evidentes
- [ ] Las fechas/numeros mencionados son coherentes
- [ ] Si menciona adjuntos, verifica que los mencione correctamente
- [ ] No contiene informacion potencialmente sensible expuesta

Marca cada punto con [OK] o [REVISAR] y explica brevemente si hay algo que revisar.
Responde en el mismo idioma del correo.`
  },
  {
    id: 'summarize_thread',
    name: 'Resumir hilo',
    icon: '📑',
    category: 'analysis',
    prompt: `Resume el siguiente hilo de correos electronicos.
Proporciona:
1. RESUMEN: 2-3 frases con el tema principal y estado actual
2. PARTICIPANTES: quienes intervienen y su posicion
3. PENDIENTES: acciones o decisiones que quedan por resolver
4. CRONOLOGIA: puntos clave en orden

Se breve y concreto. Responde en el mismo idioma del hilo.`
  },
  // --- Fase 2.1: Productividad ---
  {
    id: 'bilingual',
    name: 'Correo bilingue',
    icon: '🌍',
    category: 'generate',
    prompt: `Reescribe el siguiente correo en formato bilingue: primero en el idioma original y luego traducido.
Reglas:
- Mantén el texto original tal cual
- Añade un separador "---" entre ambas versiones
- La traduccion debe ser al otro idioma (si esta en español, traduce al ingles; si esta en ingles, traduce al español)
- Mantén el formato y estructura en ambas versiones
- Responde SOLO con el correo bilingue, sin explicaciones`
  },
  {
    id: 'from_transcription',
    name: 'Desde transcripcion',
    icon: '🎙️',
    category: 'generate',
    prompt: `El usuario ha pegado una transcripcion de audio (nota de voz, reunion, etc). Convierte eso en un correo profesional.
Reglas:
- Transforma el lenguaje hablado/coloquial en texto escrito profesional
- Elimina muletillas, repeticiones y relleno tipico del habla
- Mantén toda la informacion relevante
- Estructura el correo con saludo, cuerpo y despedida
- Responde SOLO con el correo generado, sin explicaciones
- Usa el mismo idioma de la transcripcion`
  },
  {
    id: 'readability',
    name: 'Metricas legibilidad',
    icon: '📊',
    category: 'analysis',
    prompt: `Analiza la legibilidad del siguiente correo. Proporciona:

METRICAS:
- Longitud: [numero de palabras]
- Frases: [numero de frases]
- Promedio palabras/frase: [numero]
- Nivel: [facil/medio/dificil]
- Vocabulario: [sencillo/tecnico/mixto]

EVALUACION: [1-2 frases sobre la legibilidad general]
SUGERENCIAS: [2-3 mejoras concretas si las hay]

Responde en el mismo idioma del correo.`
  },
  {
    id: 'suggest_cc',
    name: 'Sugerir CC/BCC',
    icon: '👥',
    category: 'analysis',
    prompt: `Analiza el contenido del siguiente correo y sugiere si deberia incluirse a alguien mas en copia (CC) o copia oculta (BCC).
Basandote en:
- Personas o equipos mencionados en el texto
- Temas que requieran aprobacion o conocimiento de terceros
- Buenas practicas de comunicacion corporativa

Responde con:
CC SUGERIDO: [personas/roles que deberian estar en copia, o "Ninguno"]
BCC SUGERIDO: [personas/roles para copia oculta, o "Ninguno"]
RAZON: [breve explicacion]

Responde en el mismo idioma del correo.`
  },
  {
    id: 'adapt_thread',
    name: 'Adaptar al hilo',
    icon: '🔗',
    category: 'general',
    prompt: `Mejora el siguiente correo adaptandolo al tono y estilo del hilo de conversacion existente.
Te proporcionare el correo nuevo (que el usuario ha escrito) y el hilo citado (correos anteriores).
Reglas:
- Analiza el tono del hilo (formal/informal/tecnico/etc)
- Adapta el correo del usuario para que sea coherente con ese tono
- No cambies el significado ni la intencion del mensaje
- Mantén la consistencia con las convenciones del hilo (formato, saludo, despedida)
- Responde SOLO con el correo mejorado, sin explicaciones
- Usa el mismo idioma del hilo`
  },
  {
    id: 'generate_signature',
    name: 'Generar firma',
    icon: '✍️',
    category: 'generate',
    prompt: `Genera una firma profesional para correo electronico basandote en la informacion que te proporcione el usuario.
Reglas:
- La firma debe ser concisa (3-5 lineas maximo)
- Incluye nombre, cargo y datos de contacto si los proporciona
- Formato profesional y limpio
- Responde SOLO con la firma, sin explicaciones
- Usa el mismo idioma del texto proporcionado`
  },
  {
    id: 'recipient_context',
    name: 'Contexto destinatario',
    icon: '🎯',
    category: 'general',
    prompt: `Mejora el siguiente correo adaptando el tono segun el tipo de destinatario indicado.
Te proporcionare el correo y el tipo de destinatario (cliente, jefe, companero, proveedor, etc).
Reglas:
- Ajusta formalidad, cortesia y vocabulario al destinatario
- No cambies el contenido ni la intencion
- Responde SOLO con el correo mejorado, sin explicaciones
- Usa el mismo idioma del texto original`
  },
  {
    id: 'insert_snippet',
    name: 'Insertar snippet',
    icon: '📎',
    category: 'generate',
    prompt: `El usuario quiere integrar un fragmento de texto (snippet) en su correo de forma natural.
Te proporcionare el correo actual y el snippet a integrar.
Reglas:
- Integra el snippet de forma natural en el flujo del correo
- No pegues el snippet tal cual, adaptalo al contexto
- Mantén el tono y estilo del correo original
- Responde con el correo COMPLETO (incluyendo el snippet integrado), sin explicaciones`
  }
];

class PromptManager {
  /**
   * Obtiene el prompt activo (por ID de perfil o personalizado)
   * @param {string} [profileId] - ID del perfil a usar (si no se pasa, usa el activo)
   * @returns {Promise<string>}
   */
  static async getActivePrompt(profileId) {
    // Si se pide un perfil especifico
    if (profileId) {
      return this.getPromptById(profileId);
    }

    // Buscar perfil activo guardado
    const stored = await browser.storage.local.get(STORAGE_KEYS.activeProfileId);
    const activeId = stored[STORAGE_KEYS.activeProfileId];

    if (activeId) {
      return this.getPromptById(activeId);
    }

    // Fallback: prompt personalizado o default
    const promptStored = await browser.storage.local.get(STORAGE_KEYS.userPrompt);
    return promptStored[STORAGE_KEYS.userPrompt] || DEFAULT_PROMPT;
  }

  /**
   * Obtiene un prompt por su ID (builtin o custom)
   * @param {string} id
   * @returns {Promise<string>}
   */
  static async getPromptById(id) {
    // Buscar en builtins
    const builtin = BUILTIN_PROMPTS.find(p => p.id === id);
    if (builtin) return builtin.prompt;

    // Buscar en perfiles personalizados
    const profiles = await this.getCustomProfiles();
    const custom = profiles.find(p => p.id === id);
    if (custom) return custom.prompt;

    // Fallback
    return DEFAULT_PROMPT;
  }

  /**
   * Establece el perfil activo
   * @param {string} profileId
   */
  static async setActiveProfile(profileId) {
    await browser.storage.local.set({ [STORAGE_KEYS.activeProfileId]: profileId });
  }

  /**
   * Obtiene todos los prompts disponibles (builtins + custom)
   * @returns {Promise<Array>}
   */
  static async getAllPrompts() {
    const custom = await this.getCustomProfiles();
    return [
      ...BUILTIN_PROMPTS,
      ...custom.map(p => ({ ...p, isCustom: true }))
    ];
  }

  /**
   * Obtiene los prompts builtin
   * @returns {Array}
   */
  static getBuiltinPrompts() {
    return BUILTIN_PROMPTS;
  }

  /**
   * Obtiene los perfiles personalizados del storage
   * @returns {Promise<Array>}
   */
  static async getCustomProfiles() {
    const stored = await browser.storage.local.get(STORAGE_KEYS.promptProfiles);
    return stored[STORAGE_KEYS.promptProfiles] || [];
  }

  /**
   * Guarda un perfil personalizado (crear o actualizar)
   * @param {{id?: string, name: string, icon: string, prompt: string}} profile
   * @returns {Promise<string>} ID del perfil
   */
  static async saveCustomProfile(profile) {
    const profiles = await this.getCustomProfiles();

    if (profile.id) {
      // Actualizar existente
      const index = profiles.findIndex(p => p.id === profile.id);
      if (index !== -1) {
        profiles[index] = { ...profiles[index], ...profile };
      }
    } else {
      // Crear nuevo
      profile.id = 'custom_' + Date.now();
      profile.category = 'custom';
      profiles.push(profile);
    }

    await browser.storage.local.set({ [STORAGE_KEYS.promptProfiles]: profiles });
    return profile.id;
  }

  /**
   * Elimina un perfil personalizado
   * @param {string} id
   */
  static async deleteCustomProfile(id) {
    const profiles = await this.getCustomProfiles();
    const filtered = profiles.filter(p => p.id !== id);
    await browser.storage.local.set({ [STORAGE_KEYS.promptProfiles]: filtered });

    // Si el perfil eliminado era el activo, resetear
    const stored = await browser.storage.local.get(STORAGE_KEYS.activeProfileId);
    if (stored[STORAGE_KEYS.activeProfileId] === id) {
      await browser.storage.local.remove(STORAGE_KEYS.activeProfileId);
    }
  }

  /**
   * Guarda el prompt base personalizado (legacy/opciones)
   * @param {string} prompt
   */
  static async savePrompt(prompt) {
    await browser.storage.local.set({ [STORAGE_KEYS.userPrompt]: prompt });
  }

  /**
   * Restaura el prompt por defecto
   */
  static async resetPrompt() {
    await browser.storage.local.remove(STORAGE_KEYS.userPrompt);
    await browser.storage.local.remove(STORAGE_KEYS.activeProfileId);
  }

  /**
   * Devuelve el prompt por defecto
   * @returns {string}
   */
  static getDefaultPrompt() {
    return DEFAULT_PROMPT;
  }

  /**
   * Resuelve variables en un prompt
   * @param {string} prompt - Prompt con variables {var}
   * @param {object} vars - {idioma: 'ingles', tono: 'formal', ...}
   * @returns {string}
   */
  static resolveVariables(prompt, vars = {}) {
    return prompt.replace(/\{(\w+)\}/g, (match, key) => {
      return vars[key] !== undefined ? vars[key] : match;
    });
  }

  /**
   * Extrae las variables de un prompt
   * @param {string} prompt
   * @returns {string[]} Lista de nombres de variables
   */
  static extractVariables(prompt) {
    const matches = prompt.match(/\{(\w+)\}/g) || [];
    return [...new Set(matches.map(m => m.slice(1, -1)))];
  }

  // --- Plantillas inteligentes ---

  static async getTemplates() {
    const stored = await browser.storage.local.get('emailTemplates');
    return stored.emailTemplates || [];
  }

  static async saveTemplate(template) {
    const templates = await this.getTemplates();
    if (template.id) {
      const idx = templates.findIndex(t => t.id === template.id);
      if (idx !== -1) templates[idx] = { ...templates[idx], ...template };
    } else {
      template.id = 'tpl_' + Date.now();
      templates.push(template);
    }
    await browser.storage.local.set({ emailTemplates: templates });
    return template.id;
  }

  static async deleteTemplate(id) {
    const templates = await this.getTemplates();
    await browser.storage.local.set({
      emailTemplates: templates.filter(t => t.id !== id)
    });
  }

  // --- Modo aprendizaje ---

  static async saveWritingStyle(sampleText) {
    const stored = await browser.storage.local.get('writingStyle');
    const samples = stored.writingStyle?.samples || [];
    samples.push(sampleText.substring(0, LIMITS.MAX_WRITING_STYLE_SAMPLE_LENGTH));
    while (samples.length > LIMITS.MAX_WRITING_STYLE_SAMPLES) samples.shift();
    await browser.storage.local.set({ writingStyle: { samples, updatedAt: Date.now() } });
  }

  static async getWritingStyleContext() {
    const stored = await browser.storage.local.get('writingStyle');
    const style = stored.writingStyle;
    if (!style?.samples?.length) return '';
    return `\n\nEstilo de escritura del usuario (adapta tu respuesta a este estilo):\n${style.samples.slice(-3).join('\n---\n')}`;
  }
}
