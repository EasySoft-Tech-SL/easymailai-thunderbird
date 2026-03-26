<p align="center">
  <img src="icons/icon.svg" width="80" height="80" alt="EasyMailAI">
</p>

<h1 align="center">EasyMailAI</h1>

<p align="center">
  <strong>Asistente de escritura de correos con IA para Mozilla Thunderbird</strong><br>
  Mejora, traduce, analiza y genera correos con Groq, OpenAI, Ollama, Mistral o cualquier API compatible con OpenAI.
</p>

<p align="center">
  <a href="https://github.com/EasySoft-Tech-SL/easymailai-thunderbird/releases"><img src="https://img.shields.io/github/v/release/EasySoft-Tech-SL/easymailai-thunderbird?label=version" alt="Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/EasySoft-Tech-SL/easymailai-thunderbird" alt="Licencia"></a>
  <a href="https://easysoft.es"><img src="https://img.shields.io/badge/por-Easysoft-0969da" alt="Easysoft"></a>
</p>

<p align="center">
  <a href="README.md">English</a> | <strong>Español</strong>
</p>

---

## Tabla de Contenidos

- [Vision general](#vision-general)
- [Instalacion](#instalacion)
- [Inicio rapido](#inicio-rapido)
- [Acciones del Popup](#acciones-del-popup)
  - [Mejora de escritura](#mejora-de-escritura)
  - [Generacion de contenido](#generacion-de-contenido)
  - [Analisis y revision](#analisis-y-revision)
  - [Aprendizaje y snippets](#aprendizaje-y-snippets)
  - [Opciones avanzadas](#opciones-avanzadas-tono-longitud-traduccion)
- [Pagina de Configuracion](#pagina-de-configuracion)
  - [Proveedor de IA](#proveedor-de-ia)
  - [Proveedor de respaldo](#proveedor-de-respaldo)
  - [Parametros de API](#parametros-de-api)
  - [Prompt del sistema](#prompt-del-sistema)
  - [Prompt de autocompletado](#prompt-de-autocompletado)
  - [Prompts personalizados](#prompts-personalizados)
  - [Funcionalidades](#funcionalidades)
  - [Snippets](#snippets--respuestas-rapidas)
  - [Contexto por cuenta](#contexto-por-cuenta)
  - [Plantillas de correo](#plantillas-de-correo)
  - [Exportar / Importar](#exportar--importar)
  - [Historial de mejoras](#historial-de-mejoras)
- [Proveedores compatibles](#proveedores-compatibles)
- [Atajos de teclado y menu contextual](#atajos-de-teclado-y-menu-contextual)
- [Privacidad y seguridad](#privacidad-y-seguridad)
- [Actualizacion automatica](#actualizacion-automatica)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Desarrollo](#desarrollo)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

---

## Vision general

EasyMailAI integra IA directamente en el compositor de correos de Thunderbird. Escribe mejores correos, genera respuestas, analiza el tono, traduce y mucho mas, todo sin salir de tu bandeja de entrada.

Funciona con **Groq**, **OpenAI**, **Ollama** (100% local), **Mistral** o cualquier proveedor que implemente el endpoint `/v1/chat/completions` compatible con OpenAI.

**Puntos clave:**
- Mas de 30 acciones de IA organizadas en secciones
- Plantillas inteligentes que se rellenan con datos reales del correo
- Tono e idioma por defecto por cuenta de Thunderbird
- Aprendizaje del estilo de escritura
- Internacionalizacion completa (ingles + español)
- Modo oscuro automatico
- Sin dependencias, JavaScript puro

---

## Instalacion

### Desde Release (Recomendado)

1. Descarga el ultimo `.xpi` desde [Releases](https://github.com/EasySoft-Tech-SL/easymailai-thunderbird/releases)
2. En Thunderbird: **Menu > Complementos y temas > Extensiones**
3. Icono del engranaje > **Instalar complemento desde archivo**
4. Selecciona el archivo `.xpi` descargado
5. Haz clic en el icono de la llave para abrir la configuracion y configura tu proveedor de IA

### Desde codigo fuente

```bash
git clone https://github.com/EasySoft-Tech-SL/easymailai-thunderbird.git
cd easymailai-thunderbird
# En Thunderbird: Herramientas > Herramientas de desarrollo > Depurar complementos > Cargar complemento temporal
# Selecciona manifest.json
```

**Requisitos:** Thunderbird 115+ (ESR o posterior)

---

## Inicio rapido

1. **Configura un proveedor**: Abre la configuracion de EasyMailAI (icono de llave) > selecciona Groq/OpenAI/Ollama > introduce tu API key > pulsa refrescar para cargar modelos > Guardar
2. **Escribe un correo**: Abre una ventana de redaccion y escribe algo
3. **Pulsa el boton EasyMailAI** en la barra del compositor
4. **Elige una accion**: Pulsa "Mejorar redaccion" o cualquier otra accion
5. **Vista previa**: Compara antes/despues > Aceptar o Descartar

---

## Acciones del Popup

Al pulsar el boton de EasyMailAI en la ventana de redaccion, aparece un popup organizado en secciones. Cada accion tiene un icono **?** de ayuda que muestra una explicacion detallada al pasar el raton.

### Mejora de escritura

Estas acciones modifican el texto que ya has escrito. Si tienes texto **seleccionado**, solo se procesa la seleccion. Si no, se procesa todo el cuerpo del correo (excluyendo firma y contenido citado).

| Accion | Icono | Que hace |
|--------|-------|----------|
| **Mejorar redaccion** | ✨ | Corrige gramatica, ortografia, puntuacion y estilo manteniendo el significado original. Accion principal, boton grande arriba. |
| **Formalizar** | 👔 | Reescribe el correo con tono formal y profesional. Añade formulas de cortesia si faltan. |
| **Simplificar** | 💡 | Simplifica usando frases cortas y vocabulario sencillo sin perder informacion. |
| **Acortar** | ✂️ | Reduce la longitud al minimo necesario. Elimina repeticiones y relleno. |
| **Expandir** | 📝 | Desarrolla y detalla el texto para que sea mas completo y elaborado. |
| **Solo gramatica** | 📖 | Corrige SOLO errores de gramatica y ortografia. NO cambia estilo, tono ni estructura. |
| **Tono amigable** | 😊 | Reescribe con tono calido y cercano, manteniendo la profesionalidad. |
| **Tono diplomatico** | 🤝 | Suaviza expresiones directas o agresivas con lenguaje diplomatico y conciliador. |
| **Contexto destinatario** | 🎯 | Abre un selector para elegir tipo de destinatario (cliente, jefe, companero, proveedor) y adapta el tono. |
| **Adaptar al hilo** | 🔗 | Analiza el tono del hilo existente y adapta tu correo para ser coherente. Requiere correo citado. |

**Como funciona la vista previa:**
1. Despues de procesar, ves una vista previa con dos pestanas: "Mejorado" y "Original"
2. Pulsa **Aceptar** para aplicar los cambios
3. Pulsa **Descartar** para mantener el texto original
4. Despues de aplicar, puedes pulsar **Deshacer** para revertir

### Generacion de contenido

Estas acciones generan contenido nuevo o transforman texto existente.

| Accion | Icono | Que hace |
|--------|-------|----------|
| **Generar respuesta** | ↩️ | Lee el correo citado al que respondes y genera una respuesta profesional. Abre un dialogo donde puedes escribir instrucciones como "acepta la reunion", "rechaza educadamente", "pide mas info". |
| **Desde notas** | 📋 | Convierte puntos clave, notas sueltas o ideas en un correo profesional completo con saludo y despedida. |
| **Completar texto** | 🔮 | La IA continua escribiendo donde lo dejaste, manteniendo tu tono y estilo. |
| **Sugerir parrafo** | 💭 | Sugiere el siguiente parrafo basandose en lo que llevas escrito. Solo añade el parrafo nuevo. |
| **Generar asunto** | 📌 | Genera 3 opciones de linea de asunto basadas en el contenido. Pulsa cualquiera para aplicarla. |
| **Correo bilingue** | 🌍 | Genera el mismo correo en dos idiomas, separados por un divisor. |
| **Desde transcripcion** | 🎙️ | Convierte transcripciones de audio (notas de voz de WhatsApp, grabaciones de reuniones) en un correo profesional. |
| **Generar firma** | ✍️ | Genera una firma profesional para correos (3-5 lineas). |
| **Modo batch** | ⚡ | Aplica "Mejorar redaccion" a TODOS los borradores abiertos a la vez. Muestra resumen de exitos/fallos. |

### Analisis y revision

Estas acciones analizan tu correo sin modificarlo. Los resultados se muestran en un panel de solo lectura.

| Accion | Icono | Que hace |
|--------|-------|----------|
| **Analizar tono** | 🎭 | Analiza como suena tu correo (formal, agresivo, pasivo-agresivo, amigable, neutro, urgente). Muestra la impresion percibida y sugerencias concretas. |
| **Sentimiento recibido** | 🔍 | Analiza el tono del correo que has RECIBIDO (contenido citado). Indica si es positivo, negativo, urgente o molesto, y recomienda como responder. |
| **Detectar ambiguedad** | ⚠️ | Encuentra frases que podrian malinterpretarse. Para cada una, muestra por que es problematica y sugiere una alternativa mas clara. |
| **Checklist pre-envio** | ✅ | Revision completa antes de enviar: saludo, despedida, coherencia de tono, gramatica, fechas/numeros, mencion de adjuntos, informacion sensible. Cada punto marcado [OK] o [REVISAR]. |
| **Resumir hilo** | 📑 | Resume una conversacion larga: tema principal, participantes y sus posiciones, acciones pendientes y cronologia. |
| **Metricas legibilidad** | 📊 | Analisis de legibilidad: numero de palabras, frases, promedio palabras/frase, nivel de dificultad, tipo de vocabulario y sugerencias. |
| **Sugerir CC/BCC** | 👥 | Analiza el contenido y sugiere personas o roles que deberian estar en copia basandose en temas mencionados y buenas practicas corporativas. |

### Aprendizaje y snippets

| Accion | Icono | Que hace |
|--------|-------|----------|
| **Aprender mi estilo** | 🧠 | Guarda una muestra del correo actual como referencia de tu estilo de escritura (hasta 10 muestras, 1000 caracteres cada una). Las futuras acciones de IA adaptaran su resultado a tu estilo personal: tus patrones de saludo, vocabulario, longitud de frases, tono, etc. Se desactiva en ajustes. |

**Seccion Snippets:**

| Accion | Icono | Que hace |
|--------|-------|----------|
| **Snippets** | 📎 | Abre una lista de tus fragmentos de texto guardados. Pulsa uno para insertarlo. Si el correo ya tiene texto, la IA lo integra naturalmente en el flujo en vez de pegarlo. Si esta vacio, lo inserta directamente. Se crean en Configuracion. |

**Seccion Plantillas:**

| Accion | Icono | Que hace |
|--------|-------|----------|
| **Plantillas** | 📄 | Abre una lista de tus plantillas guardadas. Pulsa una para aplicarla. Las plantillas pueden tener campos `{variable}` que la IA rellena automaticamente usando datos reales del compositor: nombre del destinatario (del campo "Para"), asunto, texto del cuerpo y correo citado. Si un campo no se puede determinar, se deja el `{placeholder}` tal cual. Se crean en Configuracion. |

### Opciones avanzadas (Tono, Longitud, Traduccion)

Debajo del grid de acciones hay una seccion colapsable **"Opciones avanzadas"**. Son **modificadores** que se combinan con cualquier accion:

| Opcion | Valores | Efecto |
|--------|---------|--------|
| **Tono** | Sin cambio / Formal / Informal / Amigable / Directo / Diplomatico | Sobreescribe el tono de cualquier accion. Ej: "Simplificar" + Tono "Formal" = simplifica Y formaliza. |
| **Longitud** | Mas corto / Igual / Mas largo | Controla la longitud del resultado. Ej: "Mejorar" + "Mas corto" = mejora Y condensa. |
| **Traducir a** | 10 idiomas (español, ingles, frances, aleman, italiano, portugues, catalan, chino, japones, arabe) | Traduce el resultado final. Ej: "Mejorar" + Traducir "Ingles" = mejora Y traduce al ingles. |

**Se combinan entre si:** Puedes seleccionar las tres a la vez. Ejemplo: "Mejorar" + Formal + Mas corto + Ingles = mejora, formaliza, acorta Y traduce al ingles en un solo clic.

---

## Pagina de Configuracion

Abre la configuracion con el icono de llave en la tarjeta de EasyMailAI en el gestor de complementos.

### Proveedor de IA

| Campo | Descripcion |
|-------|-------------|
| **Proveedor** | Selecciona entre Groq, OpenAI, Ollama (Local), Mistral o Personalizado. Desplegable con busqueda. |
| **URL Base** | Endpoint de la API. Se rellena automaticamente al seleccionar proveedor. Editable para configuraciones personalizadas (ej: Ollama en otro puerto). |
| **API Key** | Tu clave de API del proveedor. No necesaria para Ollama. Oculta por defecto, pulsa el icono del ojo para mostrarla. |
| **Modelo** | Desplegable con busqueda. Pulsa el boton de refrescar (⟳) para cargar modelos disponibles desde la API del proveedor. |
| **Probar conexion** | Envia una peticion de prueba minima para verificar que la configuracion funciona. Muestra latencia y respuesta del modelo. |

### Proveedor de respaldo

Si el proveedor principal falla (timeout, limite, error de servidor), EasyMailAI reintenta automaticamente con el proveedor de respaldo.

| Campo | Descripcion |
|-------|-------------|
| **Activar fallback** | Activar/desactivar |
| **Proveedor / URL / Key / Modelo** | Igual que el principal, pero para el proveedor de respaldo |

### Parametros de API

| Campo | Defecto | Descripcion |
|-------|---------|-------------|
| **Temperatura** | 0.7 | Controla la creatividad de la IA. 0 = deterministico (misma entrada = misma salida). 1 = creativo. 2 = muy aleatorio. |
| **Max tokens de respuesta** | 4096 | Longitud maxima de las respuestas. Aumentar para correos largos, reducir para respuestas mas rapidas. |

### Prompt del sistema

Prompt base usado para la accion "Mejorar redaccion". Puedes personalizarlo para cambiar como la IA mejora el texto. Cada accion predefinida (Formalizar, Simplificar, etc.) tiene su propio prompt incorporado que sobreescribe este.

Pulsa **"Restaurar por defecto"** para volver al prompt original.

### Prompt de autocompletado

Prompt usado para las sugerencias de texto fantasma (ghost text), si estan activadas. Controla como la IA sugiere continuaciones mientras escribes.

### Prompts personalizados

Crea tus propias acciones de IA que aparecen como botones en el popup junto a las incorporadas.

| Campo | Descripcion |
|-------|-------------|
| **Nombre** | Etiqueta del boton en el popup (ej: "Email comercial") |
| **Icono** | Un emoji para el boton (ej: 💼) |
| **Prompt** | Las instrucciones que recibe la IA. Escribelo como si instruyeras a una persona: "Reescribe este correo como un pitch de ventas. Reglas: ..." |

**Casos de uso:** "Respuesta a reclamacion" (tono empatico), "Email a proveedor" (directo, pedir presupuesto), "Seguimiento proyecto" (consultar estado sin ser pesado), "Presentacion empresa" (introducir tu negocio).

### Funcionalidades

Activa o desactiva grupos de funciones individuales:

| Funcionalidad | Que controla |
|---------------|-------------|
| **Accion rapida del boton** | Configurable: que accion ejecuta el boton (Mejorar, Formalizar, etc.) |
| **Autocompletado (Ghost Text)** | Sugerencias de texto en tiempo real mientras escribes (Tab para aceptar, Esc para descartar). Retardo configurable (defecto 2000ms). *Nota: requiere soporte de Thunderbird para compose_scripts.* |
| **Selector de tono** | Mostrar/ocultar el desplegable de tono en las opciones avanzadas del popup |
| **Ajuste de longitud** | Mostrar/ocultar el control de longitud en el popup |
| **Traduccion** | Mostrar/ocultar el selector de idioma en el popup |
| **Generacion de contenido** | Mostrar/ocultar todas las acciones de generacion (respuesta, notas, asunto, bilingue, transcripcion, firma, plantillas, snippets, batch) |
| **Analisis de correo** | Mostrar/ocultar todas las acciones de analisis (tono, sentimiento, ambiguedad, checklist, resumen, legibilidad, CC/BCC) |
| **Modo aprendizaje** | Activar/desactivar el aprendizaje de estilo de escritura. Cuando esta activo, la IA recibe tus muestras guardadas con cada accion para adaptar su resultado a tu estilo. |

### Snippets / Respuestas rapidas

Fragmentos de texto reutilizables que la IA integra naturalmente en tus correos.

| Campo | Descripcion |
|-------|-------------|
| **Nombre** | Nombre descriptivo (ej: "Adjunto factura") |
| **Contenido** | El fragmento de texto (ej: "Adjunto encontrara la factura correspondiente al mes en curso. Por favor, confirme la recepcion.") |

**Como funciona:** Cuando insertas un snippet en un correo que ya tiene texto, la IA no lo pega al final: lee tu correo y lo integra naturalmente en el flujo, adaptandolo al contexto y tono.

### Contexto por cuenta

Asocia tono e idioma por defecto a cada cuenta de correo de Thunderbird. Cuando redactas desde una cuenta concreta, EasyMailAI aplica automaticamente las preferencias de esa cuenta.

| Campo | Descripcion |
|-------|-------------|
| **Cuenta** | Cada cuenta de Thunderbird aparece con su direccion de correo |
| **Tono** | Tono por defecto para esta cuenta (Formal, Informal, Amigable, Directo, Diplomatico) |
| **Idioma** | Idioma de salida por defecto para esta cuenta |

Pulsa **"Cargar cuentas"** para refrescar la lista si has añadido cuentas nuevas.

### Plantillas de correo

Plantillas con campos `{variable}` que la IA rellena usando datos reales del compositor.

| Campo | Descripcion |
|-------|-------------|
| **Nombre** | Nombre de la plantilla (ej: "Seguimiento de proyecto") |
| **Contenido** | Texto del correo con `{placeholders}`. Ejemplo: `Estimado {cliente}, le escribo respecto a {proyecto}. Queria consultar el estado de {tema}...` |

**Relleno inteligente de variables:** Al aplicar una plantilla, la IA lee:
- **Campo Para** → extrae el nombre del destinatario
- **Asunto** → extrae contexto
- **Cuerpo del correo** → usa el texto existente
- **Correo citado** → extrae nombres y temas de la conversacion

Si una variable no se puede determinar del contexto, el `{placeholder}` se deja tal cual para que lo rellenes manualmente.

### Exportar / Importar

| Accion | Descripcion |
|--------|-------------|
| **Exportar** | Descarga un archivo JSON con toda tu configuracion: proveedores, prompts, plantillas, snippets, funcionalidades, estilo de escritura. **Las API keys NO se exportan** por seguridad. |
| **Importar** | Sube un archivo JSON exportado previamente. Aplica toda la configuracion excepto las API keys (mantienes tus claves actuales). La pagina se recarga tras importar. |

### Historial de mejoras

Muestra las ultimas 20 mejoras realizadas con EasyMailAI: fecha/hora, accion usada y una vista previa del texto original. Pulsa **"Limpiar historial"** para borrar todo.

---

## Proveedores compatibles

| Proveedor | URL Base | API Key | Local | Modelos |
|-----------|----------|---------|-------|---------|
| [Groq](https://groq.com) | `https://api.groq.com/openai/v1` | Necesaria | No | Carga dinamica |
| [OpenAI](https://openai.com) | `https://api.openai.com/v1` | Necesaria | No | Carga dinamica |
| [Ollama](https://ollama.com) | `http://localhost:11434/v1` | No necesaria | **Si** | Carga dinamica |
| [Mistral](https://mistral.ai) | `https://api.mistral.ai/v1` | Necesaria | No | Carga dinamica |
| Personalizado | Cualquier URL | Opcional | Depende | Carga dinamica |

> Cualquier proveedor que implemente el endpoint `/v1/chat/completions` de OpenAI es compatible. Los modelos se cargan desde el endpoint `/v1/models` del proveedor. La URL base es completamente editable para configuraciones personalizadas (puertos diferentes, proxies, self-hosted).

Al usar **Ollama**, el popup muestra un indicador verde confirmando que tus datos no salen de tu equipo.

---

## Atajos de teclado y menu contextual

| Metodo | Accion |
|--------|--------|
| **Click en boton EasyMailAI** | Abre el popup con todas las acciones |
| **Ctrl+Shift+I** | Abre el popup (igual que pulsar el boton) |
| **Clic derecho sobre el texto** | Menu contextual con 5 acciones rapidas: Mejorar, Formalizar, Simplificar, Acortar, Solo gramatica. Se aplican directamente sin vista previa. |

---

## Privacidad y seguridad

- **Sin servidores intermedios** - Las llamadas API van directamente de Thunderbird a tu proveedor elegido
- **Ollama = 100% local** - Tus datos nunca salen de tu equipo
- **API keys almacenadas localmente** - Solo en el storage de la extension de Thunderbird, nunca se transmiten a otro lugar
- **Exportar excluye las keys** - La exportacion/importacion de configuracion nunca incluye credenciales de API
- **Sin telemetria** - Cero rastreo, cero analitica, cero recopilacion de datos
- **CSP aplicada** - Content Security Policy restringe origenes de scripts y conexiones
- **Mitigacion de prompt injection** - El contenido del correo enviado a la IA se envuelve en delimitadores claros para prevenir manipulacion

---

## Actualizacion automatica

EasyMailAI comprueba actualizaciones automaticamente via GitHub Releases. Thunderbird te notificara cuando haya una nueva version disponible.

Para actualizar manualmente: descarga el ultimo `.xpi` de [Releases](https://github.com/EasySoft-Tech-SL/easymailai-thunderbird/releases) e instalalo sobre la version existente.

---

## Estructura del proyecto

```
easymailai/
├── manifest.json                    # Manifest de MailExtension de Thunderbird (MV2)
├── background.js                    # Orquestador principal - enrutamiento, llamadas API, handlers
├── updates.json                     # Manifest de auto-actualizacion para Thunderbird
├── lib/
│   ├── constants.js                 # Constantes: proveedores, limites, defaults API, mapas i18n
│   ├── i18n-helper.js               # Internacionalizacion: applyI18n(), msg()
│   ├── searchable-select.js         # Componente dropdown con busqueda
│   ├── api-client.js                # Cliente API compatible OpenAI con fallback y carga de modelos
│   ├── text-processor.js            # Manejo HTML/plain text, deteccion de firmas, contenido citado
│   └── prompt-manager.js            # 25+ prompts incorporados, perfiles, plantillas, snippets, aprendizaje
├── compose/
│   ├── compose-action.html          # UI del popup con grid de acciones por secciones
│   ├── compose-action.js            # Logica del popup: acciones, vistas, tooltips, analisis
│   ├── compose-action.css           # Estilos del popup con modo oscuro
│   ├── autocomplete.js              # Sugerencias de ghost text en tiempo real
│   └── autocomplete.css             # Estilos del ghost text
├── options/
│   ├── options.html                 # Pagina completa de configuracion
│   ├── options.js                   # Logica: CRUD, proveedores, funcionalidades, exportar/importar
│   └── options.css                  # Estilos con modo oscuro
├── icons/icon.svg                   # Icono de la extension (SVG)
├── _locales/
│   ├── es/messages.json             # Localizacion español (280+ claves)
│   └── en/messages.json             # Localizacion ingles (280+ claves)
├── .github/workflows/build.yml      # CI: valida, empaqueta .xpi, crea Release en GitHub
├── LICENSE                          # MIT
├── README.md                        # Documentacion en ingles
└── README.es.md                     # Este archivo
```

---

## Desarrollo

```bash
# Clonar el repositorio
git clone https://github.com/EasySoft-Tech-SL/easymailai-thunderbird.git

# Cargar en Thunderbird para desarrollo
# Herramientas > Herramientas de desarrollo > Depurar complementos > Cargar complemento temporal
# Selecciona manifest.json

# Depurar
# Ctrl+Shift+J para la consola de errores
# Depurar complementos > Inspeccionar para DevTools completas

# Tras cambios en el codigo, pulsa "Recargar" en Depurar complementos

# Validar sintaxis JS
node -c background.js
node -c compose/compose-action.js
node -c options/options.js

# Empaquetar como .xpi
git archive --format=zip --output=easymailai.xpi HEAD -- manifest.json background.js updates.json LICENSE lib/ compose/ options/ icons/ _locales/
```

---

## Contribuir

Se aceptan issues y pull requests. Para cambios importantes, abre un issue primero para discutirlo.

1. Haz fork del repositorio
2. Crea tu rama de feature (`git checkout -b feature/mi-feature`)
3. Haz commit de tus cambios
4. Push a la rama
5. Abre un Pull Request

---

## Licencia

[MIT](LICENSE)

---

## Acerca de

**EasyMailAI** esta desarrollado por [Easysoft Tech S.L.](https://easysoft.es)

- **Autor:** Alberto Luque Rivas
- **Email:** desarrollo@easysoft.es
- **Web:** [https://easysoft.es](https://easysoft.es)

---

<p align="center">
  <sub>Desarrollado con dedicacion por <a href="https://easysoft.es">Easysoft</a></sub>
</p>
