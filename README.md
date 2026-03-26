<p align="center">
  <img src="icons/icon.svg" width="80" height="80" alt="EasyMailAI">
</p>

<h1 align="center">EasyMailAI</h1>

<p align="center">
  <strong>AI-powered email writing assistant for Mozilla Thunderbird</strong><br>
  Improve, translate, analyze, and generate emails with Groq, OpenAI, Ollama, Mistral, or any OpenAI-compatible API.
</p>

<p align="center">
  <a href="https://github.com/EasySoft-Tech-SL/easymailai-thunderbird/releases"><img src="https://img.shields.io/github/v/release/EasySoft-Tech-SL/easymailai-thunderbird?label=version" alt="Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/EasySoft-Tech-SL/easymailai-thunderbird" alt="License"></a>
  <a href="https://easysoft.es"><img src="https://img.shields.io/badge/by-Easysoft-4F46E5" alt="Easysoft"></a>
</p>

---

## Overview

EasyMailAI integrates AI directly into Thunderbird's email composer. Write better emails, generate replies, analyze tone, translate, and much more - all without leaving your inbox.

Works with **Groq**, **OpenAI**, **Ollama** (100% local), **Mistral**, or any provider that implements the OpenAI-compatible `/v1/chat/completions` endpoint.

## Installation

### From Release (Recommended)

1. Download the latest `.xpi` from [Releases](https://github.com/EasySoft-Tech-SL/easymailai-thunderbird/releases)
2. In Thunderbird: **Menu > Add-ons and Themes > Extensions**
3. Click the gear icon > **Install Add-on From File**
4. Select the downloaded `.xpi` file
5. Open **EasyMailAI Options** and configure your AI provider and API key

### From Source

```bash
git clone https://github.com/EasySoft-Tech-SL/easymailai-thunderbird.git
cd easymailai-thunderbird
# In Thunderbird: Menu > Add-ons > Extensions > gear > Debug Add-ons > Load Temporary Add-on
# Select manifest.json
```

**Requirements:** Thunderbird 115+ (ESR or later)

## Features

### Writing Enhancement

| Feature | Description |
|---------|-------------|
| **Improve writing** | Fix grammar, style, and clarity with one click |
| **Tone adjustment** | Formal, informal, friendly, direct, diplomatic |
| **Length control** | Shorten, keep same, or expand text |
| **Translation** | Translate to 10+ languages |
| **Grammar-only** | Fix errors without changing style |
| **Selection support** | Process only selected text or the full body |
| **Ghost text autocomplete** | AI suggests continuations as you type (Tab to accept, Esc to dismiss) |
| **Recipient context** | Adapt tone based on recipient type (client, boss, colleague, vendor) |
| **Adapt to thread** | Match the tone of the existing email thread |

### Content Generation

| Feature | Description |
|---------|-------------|
| **Generate reply** | Draft a reply based on the received email with custom instructions |
| **From bullet points** | Turn rough notes into a polished email |
| **Generate subject** | Get 3 AI-suggested subject lines to choose from |
| **Complete text** | AI finishes where you left off |
| **Suggest paragraph** | Get continuation suggestions |
| **Bilingual email** | Same message in two languages |
| **From transcription** | Voice notes or meeting transcripts to professional email |
| **Smart templates** | Templates with `{variable}` placeholders filled by AI |
| **Snippets** | Frequent fragments naturally integrated by AI |
| **Generate signature** | Create a professional email signature |
| **Batch mode** | Improve all open drafts at once |

### Analysis & Review

| Feature | Description |
|---------|-------------|
| **Tone analysis** | Check how your email sounds before sending |
| **Sentiment analysis** | Understand the tone of received emails |
| **Ambiguity detector** | Find phrases that could be misinterpreted |
| **Pre-send checklist** | Verify greeting, closing, attachments, sensitive info |
| **Thread summary** | Summarize long email conversations |
| **Readability metrics** | Word count, complexity, readability level |
| **CC/BCC suggestions** | AI suggests who should be copied |

### Configuration

| Feature | Description |
|---------|-------------|
| **Multi-provider** | Groq, OpenAI, Ollama (local), Mistral, or any compatible API |
| **Dynamic models** | Fetches available models from the provider API |
| **Fallback provider** | Automatic failover if primary fails |
| **Custom prompts** | Create and manage your own prompt profiles |
| **API parameters** | Configurable temperature and max tokens |
| **Editable autocomplete prompt** | Customize how ghost text works |
| **Per-account context** | Tone and language defaults per Thunderbird account |
| **Learning mode** | AI learns your writing style over time |
| **Feature toggles** | Enable/disable any feature individually |
| **Export/Import** | Share config across installations (API keys excluded) |
| **Improvement history** | Track changes over time |
| **Keyboard shortcut** | `Ctrl+Shift+I` for quick access |
| **Context menu** | Right-click actions in the composer |
| **Dark mode** | Follows Thunderbird's system theme |
| **i18n** | Full English and Spanish localization |

## Supported Providers

| Provider | Base URL | API Key | Local |
|----------|----------|---------|-------|
| [Groq](https://groq.com) | `https://api.groq.com/openai/v1` | Required | No |
| [OpenAI](https://openai.com) | `https://api.openai.com/v1` | Required | No |
| [Ollama](https://ollama.com) | `http://localhost:11434/v1` | Not needed | **Yes** |
| [Mistral](https://mistral.ai) | `https://api.mistral.ai/v1` | Required | No |
| Custom | Any URL | Optional | Depends |

> Any provider implementing the OpenAI `/v1/chat/completions` endpoint is supported. Models are loaded dynamically from the provider's `/v1/models` endpoint.

## Privacy & Security

- **No intermediate servers** - API calls go directly from Thunderbird to your chosen provider
- **Ollama = 100% local** - Your data never leaves your machine
- **API keys stored locally** - In Thunderbird's extension storage only
- **Export excludes keys** - Config export/import never includes API credentials
- **No telemetry** - Zero tracking, zero analytics, zero data collection
- **CSP enforced** - Content Security Policy restricts script and connection sources

## Screenshots

> _Coming soon_

## Project Structure

```
easymailai/
├── manifest.json                 # Thunderbird MailExtension manifest (MV2)
├── background.js                 # Main orchestrator
├── lib/
│   ├── constants.js              # Shared constants, limits, API defaults
│   ├── i18n-helper.js            # Internationalization utilities
│   ├── api-client.js             # OpenAI-compatible client with fallback
│   ├── text-processor.js         # HTML/plain text, signatures, quoted content
│   └── prompt-manager.js         # 25+ prompts, profiles, templates, learning
├── compose/
│   ├── compose-action.html/js/css  # Popup UI with quick actions grid
│   └── autocomplete.js/css         # Real-time ghost text suggestions
├── options/
│   └── options.html/js/css         # Full settings page
├── icons/icon.svg
└── _locales/{es,en}/messages.json  # 250+ i18n keys per language
```

## Tech Stack

- **Language:** Pure JavaScript ES2020+ (no frameworks, no bundler, no dependencies)
- **Platform:** Thunderbird MailExtension API (Manifest V2)
- **APIs used:** `compose`, `composeAction`, `storage`, `menus`, `commands`, `compose_scripts`, `accountsRead`

## Development

```bash
# Clone the repository
git clone https://github.com/EasySoft-Tech-SL/easymailai-thunderbird.git

# Load in Thunderbird for development
# Menu > Add-ons > Extensions > gear > Debug Add-ons > Load Temporary Add-on
# Select the manifest.json file

# Package as .xpi
cd easymailai-thunderbird
zip -r easymailai.xpi . -x ".git/*" ".specstory/*" "*.md" ".gitignore" ".github/*"
```

## Contributing

Issues and pull requests are welcome. For major changes, please open an issue first to discuss.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

[MIT](LICENSE)

## About

**EasyMailAI** is developed by [Easysoft Tech S.L.](https://easysoft.es)

- **Author:** Alberto Luque Rivas
- **Email:** desarrollo@easysoft.es
- **Website:** [https://easysoft.es](https://easysoft.es)

---

<p align="center">
  <sub>Built with care by <a href="https://easysoft.es">Easysoft</a></sub>
</p>
