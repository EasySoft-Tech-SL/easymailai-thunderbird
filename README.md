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
  <a href="https://easysoft.es"><img src="https://img.shields.io/badge/by-Easysoft-0969da" alt="Easysoft"></a>
</p>

<p align="center">
  <strong>English</strong> | <a href="README.es.md">Español</a>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Popup Actions Reference](#popup-actions-reference)
  - [Writing Enhancement](#writing-enhancement)
  - [Content Generation](#content-generation)
  - [Analysis & Review](#analysis--review)
  - [Learning & Snippets](#learning--snippets)
  - [Advanced Options](#advanced-options-tone-length-translation)
- [Settings Page Reference](#settings-page-reference)
  - [AI Provider](#ai-provider)
  - [Fallback Provider](#fallback-provider)
  - [API Parameters](#api-parameters)
  - [System Prompt](#system-prompt)
  - [Autocomplete Prompt](#autocomplete-prompt)
  - [Custom Prompts](#custom-prompts)
  - [Features Toggle](#features-toggle)
  - [Snippets](#snippets--quick-replies)
  - [Account Context](#account-context)
  - [Email Templates](#email-templates)
  - [Export / Import](#export--import)
  - [Improvement History](#improvement-history)
- [Supported Providers](#supported-providers)
- [Keyboard Shortcuts & Context Menu](#keyboard-shortcuts--context-menu)
- [Privacy & Security](#privacy--security)
- [Auto-Update](#auto-update)
- [Project Structure](#project-structure)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)
- [About](#about)

---

## Overview

EasyMailAI integrates AI directly into Thunderbird's email composer. Write better emails, generate replies, analyze tone, translate, and much more - all without leaving your inbox.

Works with **Groq**, **OpenAI**, **Ollama** (100% local), **Mistral**, or any provider that implements the OpenAI-compatible `/v1/chat/completions` endpoint.

**Key highlights:**
- 30+ AI actions organized in sections
- Smart templates that auto-fill from email context
- Per-account tone and language defaults
- Writing style learning
- Full internationalization (English + Spanish)
- Dark mode support
- Zero dependencies, pure JavaScript

---

## Installation

### From Release (Recommended)

1. Download the latest `.xpi` from [Releases](https://github.com/EasySoft-Tech-SL/easymailai-thunderbird/releases)
2. In Thunderbird: **Menu > Add-ons and Themes > Extensions**
3. Click the gear icon > **Install Add-on From File**
4. Select the downloaded `.xpi` file
5. Click the wrench icon to open settings and configure your AI provider

### From Source

```bash
git clone https://github.com/EasySoft-Tech-SL/easymailai-thunderbird.git
cd easymailai-thunderbird
# In Thunderbird: Tools > Developer Tools > Debug Add-ons > Load Temporary Add-on
# Select manifest.json
```

**Requirements:** Thunderbird 115+ (ESR or later)

---

## Quick Start

1. **Configure a provider**: Open EasyMailAI settings (wrench icon) > select Groq/OpenAI/Ollama > enter your API key > click refresh to load models > Save
2. **Write an email**: Open a new compose window and write some text
3. **Click the EasyMailAI button** in the compose toolbar
4. **Choose an action**: Click "Improve writing" or any other action
5. **Preview**: Compare before/after > Accept or Discard

---

## Popup Actions Reference

When you click the EasyMailAI button in the compose window, you see a popup organized in sections. Each action has a **?** help icon that shows a detailed explanation on hover.

### Writing Enhancement

These actions modify the text you've already written. If you have text **selected**, only the selection is processed. Otherwise, the entire email body is processed (excluding signature and quoted content).

| Action | Icon | What it does |
|--------|------|-------------|
| **Improve writing** | ✨ | Fixes grammar, spelling, punctuation, and style while keeping the original meaning. This is the primary action, shown as a large button at the top. |
| **Formalize** | 👔 | Rewrites the email with a formal, professional tone. Adds courtesy formulas if missing. |
| **Simplify** | 💡 | Simplifies using short sentences and simple vocabulary without losing information. |
| **Shorten** | ✂️ | Reduces length to the minimum necessary. Removes repetitions and filler words. |
| **Expand** | 📝 | Develops and details the text to make it more complete and elaborate. |
| **Grammar only** | 📖 | Corrects ONLY grammar and spelling errors. Does NOT change style, tone, or structure. |
| **Friendly tone** | 😊 | Rewrites with a warm, approachable tone while maintaining professionalism. |
| **Diplomatic tone** | 🤝 | Softens direct or aggressive expressions with diplomatic, conciliatory language. |
| **Recipient context** | 🎯 | Opens a selector to choose recipient type (client, boss, colleague, vendor) and adapts the tone accordingly. |
| **Adapt to thread** | 🔗 | Analyzes the tone of the existing email thread and adapts your reply to be consistent. Requires a quoted email in the composer. |

**How the preview works:**
1. After processing, you see a preview with two tabs: "Improved" and "Original"
2. Click **Accept** to apply the changes to your email
3. Click **Discard** to keep the original text
4. After applying, you can click **Undo** to revert

### Content Generation

These actions generate new content or transform existing text.

| Action | Icon | What it does |
|--------|------|-------------|
| **Generate reply** | ↩️ | Reads the quoted email you're replying to and generates a professional response. Opens a dialog where you can type instructions like "accept the meeting", "decline politely", "ask for more info". |
| **From notes** | 📋 | Converts bullet points, rough notes, or key ideas into a complete, coherent professional email with greeting and closing. |
| **Complete text** | 🔮 | AI continues writing where you left off, matching your tone and style. |
| **Suggest paragraph** | 💭 | Suggests the next paragraph based on what you've written so far. Only adds the new paragraph, not the existing text. |
| **Generate subject** | 📌 | Generates 3 subject line options based on your email content. Click any option to apply it to the subject field. |
| **Bilingual email** | 🌍 | Generates the same email in two languages, separated by a divider. Detects the original language and translates to the other. |
| **From transcription** | 🎙️ | Converts pasted audio transcriptions (WhatsApp voice notes, meeting recordings) into a professional email. Removes filler words and spoken language patterns. |
| **Generate signature** | ✍️ | Generates a professional email signature (3-5 lines). |
| **Batch mode** | ⚡ | Applies "Improve writing" to ALL open compose windows at once. Shows a summary of successes/failures. |

### Analysis & Review

These actions analyze your email without modifying it. Results are shown in a read-only panel.

| Action | Icon | What it does |
|--------|------|-------------|
| **Analyze tone** | 🎭 | Analyzes how your email sounds (formal, aggressive, passive-aggressive, friendly, neutral, urgent). Shows the perceived impression and concrete suggestions if the tone is inappropriate. |
| **Received sentiment** | 🔍 | Analyzes the tone and sentiment of the email you RECEIVED (the quoted content). Indicates if it's positive, negative, urgent, or angry, and recommends how to respond. Requires a quoted email. |
| **Detect ambiguity** | ⚠️ | Finds phrases that could be misinterpreted. For each ambiguous phrase, shows why it's problematic and suggests a clearer alternative. |
| **Pre-send checklist** | ✅ | Comprehensive review before sending: greeting, closing, tone consistency, grammar, dates/numbers coherence, attachment mentions, sensitive information. Each item marked [OK] or [REVIEW]. |
| **Summarize thread** | 📑 | Summarizes a long email conversation: main topic, participants and their positions, pending actions, and chronology. Requires quoted content in the composer. |
| **Readability metrics** | 📊 | Shows readability analysis: word count, sentence count, average words per sentence, difficulty level, vocabulary type, and improvement suggestions. |
| **Suggest CC/BCC** | 👥 | Analyzes email content and suggests people or roles that should be in CC or BCC based on topics mentioned, approvals needed, and corporate communication best practices. |

### Learning & Snippets

| Action | Icon | What it does |
|--------|------|-------------|
| **Learn my style** | 🧠 | Saves a sample of the current email as your writing style reference (up to 10 samples, 1000 chars each). Future AI actions will adapt their output to match your personal style - your greeting patterns, vocabulary, sentence length, tone, etc. Disable in settings. |

**Snippets section:**

| Action | Icon | What it does |
|--------|------|-------------|
| **Snippets** | 📎 | Opens a list of your saved text fragments. Click one to insert it. If the email already has text, AI integrates the snippet naturally into the flow instead of just pasting it. If the email is empty, inserts directly. Create snippets in Settings. |

**Templates section:**

| Action | Icon | What it does |
|--------|------|-------------|
| **Templates** | 📄 | Opens a list of your saved email templates. Click one to apply it. Templates can have `{variable}` placeholders that AI fills automatically using real data from the composer: recipient name (from the "To" field), subject, existing body text, and quoted email content. If a variable can't be determined, it's left as-is. Create templates in Settings. |

### Advanced Options (Tone, Length, Translation)

Below the action grid, there's a collapsible **"Advanced options"** section. These are **modifiers** that combine with any action you choose:

| Option | Values | Effect |
|--------|--------|--------|
| **Tone** | No change / Formal / Informal / Friendly / Direct / Diplomatic | Overrides the tone of any action. E.g., "Simplify" + Tone "Formal" = simplify AND formalize. |
| **Length** | Shorter / Same / Longer | Controls output length. E.g., "Improve" + "Shorter" = improve AND condense. |
| **Translate to** | 10 languages (Spanish, English, French, German, Italian, Portuguese, Catalan, Chinese, Japanese, Arabic) | Translates the final result. E.g., "Improve" + Translate "English" = improve AND translate to English. |

**All three combine:** You can select tone + length + translation simultaneously. Example: "Improve" + Formal + Shorter + English = improve, formalize, shorten, AND translate to English in one click.

---

## Settings Page Reference

Open settings via the wrench icon on the EasyMailAI extension card, or from the popup's error view "Options" button.

### AI Provider

| Field | Description |
|-------|-------------|
| **Provider** | Select from Groq, OpenAI, Ollama (Local), Mistral, or Custom. Searchable dropdown. |
| **Base URL** | API endpoint. Auto-fills when you select a provider. Editable for custom setups (e.g., Ollama on a different port). |
| **API Key** | Your provider's API key. Not needed for Ollama. Hidden by default, click the eye icon to reveal. |
| **Model** | Searchable dropdown. Click the refresh button (⟳) to load available models from the provider API. Falls back to a default list if the API doesn't respond. |
| **Test connection** | Sends a minimal test request to verify your configuration works. Shows latency and model response. |

### Fallback Provider

If the primary provider fails (timeout, rate limit, server error), EasyMailAI automatically retries with the fallback provider.

| Field | Description |
|-------|-------------|
| **Enable fallback** | Toggle on/off |
| **Provider / URL / Key / Model** | Same as primary, but for the backup provider |

### API Parameters

| Field | Default | Description |
|-------|---------|-------------|
| **Temperature** | 0.7 | Controls AI creativity. 0 = deterministic (same input → same output). 1 = creative. 2 = very random. |
| **Max response tokens** | 4096 | Maximum length of AI responses. Increase for long emails, decrease for faster responses. |

### System Prompt

The base prompt used for the "Improve writing" action. You can customize it to change how the AI improves text. Each predefined action (Formalize, Simplify, etc.) has its own built-in prompt that overrides this one.

Click **"Reset to default"** to restore the original prompt.

### Autocomplete Prompt

The prompt used for ghost text suggestions (if enabled). Controls how the AI suggests continuations as you type.

### Custom Prompts

Create your own AI actions that appear as buttons in the popup alongside the built-in ones.

| Field | Description |
|-------|-------------|
| **Name** | Button label in the popup (e.g., "Sales email") |
| **Icon** | An emoji for the button (e.g., 💼) |
| **Prompt** | The instructions the AI receives. Write it like you'd instruct a person: "Rewrite this email as a sales pitch. Rules: ..." |

**Use cases:** "Reply to complaint" (empathetic tone), "Vendor email" (direct, ask for quote), "Project follow-up" (check status without being pushy), "Company presentation" (introduce your business).

### Features Toggle

Enable or disable individual feature groups:

| Feature | What it controls |
|---------|-----------------|
| **Quick action button** | Which action runs on direct button click (configurable: Improve, Formalize, etc.) |
| **Autocomplete (Ghost Text)** | Real-time text suggestions while typing (Tab to accept, Esc to dismiss). Configurable delay (default 2000ms). *Note: requires Thunderbird support for compose_scripts.* |
| **Tone selector** | Show/hide tone dropdown in popup advanced options |
| **Length adjustment** | Show/hide length control in popup advanced options |
| **Translation** | Show/hide language selector in popup advanced options |
| **Content generation** | Show/hide all generation actions (reply, bullets, subject, bilingual, transcription, signature, templates, snippets, batch) |
| **Email analysis** | Show/hide all analysis actions (tone, sentiment, ambiguity, checklist, summary, readability, CC/BCC) |
| **Learning mode** | Enable/disable writing style learning. When enabled, the AI receives your saved writing samples with every action to adapt its output to your style. |

### Snippets / Quick Replies

Reusable text fragments that AI integrates naturally into your emails.

| Field | Description |
|-------|-------------|
| **Name** | Descriptive name (e.g., "Invoice attached") |
| **Content** | The text fragment (e.g., "Please find attached the invoice for the current month. Kindly confirm receipt.") |

**How it works:** When you insert a snippet into an email that already has text, AI doesn't just paste it at the end - it reads your email and weaves the snippet naturally into the flow, adapting it to the context and tone.

### Account Context

Associate default tone and language to each Thunderbird email account. When you compose from a specific account, EasyMailAI automatically applies that account's preferences.

| Field | Description |
|-------|-------------|
| **Account** | Each Thunderbird account is listed with its email address |
| **Tone** | Default tone for this account (Formal, Informal, Friendly, Direct, Diplomatic) |
| **Language** | Default output language for this account |

Click **"Load accounts"** to refresh the list if you've added new accounts.

### Email Templates

Templates with `{variable}` placeholders that AI fills using real data from the composer.

| Field | Description |
|-------|-------------|
| **Name** | Template name (e.g., "Project follow-up") |
| **Content** | Email text with `{placeholders}`. Example: `Dear {client}, I'm writing regarding {project}. I'd like to check the status of {topic}...` |

**Smart variable filling:** When you apply a template, AI reads:
- **To field** → extracts recipient name
- **Subject** → extracts context
- **Email body** → uses existing text
- **Quoted email** → extracts names, topics from the conversation thread

If a variable can't be determined from context, the `{placeholder}` is left as-is for you to fill manually.

### Export / Import

| Action | Description |
|--------|-------------|
| **Export** | Downloads a JSON file with all your settings: provider config, prompts, templates, snippets, feature toggles, writing style. **API keys are NOT exported** for security. |
| **Import** | Upload a previously exported JSON file. Applies all settings except API keys (you keep your current keys). Page reloads after import. |

### Improvement History

Shows the last 20 improvements made with EasyMailAI: timestamp, action used, and a preview of the original text. Click **"Clear history"** to delete all entries.

---

## Supported Providers

| Provider | Base URL | API Key | Local | Models |
|----------|----------|---------|-------|--------|
| [Groq](https://groq.com) | `https://api.groq.com/openai/v1` | Required | No | Loaded dynamically |
| [OpenAI](https://openai.com) | `https://api.openai.com/v1` | Required | No | Loaded dynamically |
| [Ollama](https://ollama.com) | `http://localhost:11434/v1` | Not needed | **Yes** | Loaded dynamically |
| [Mistral](https://mistral.ai) | `https://api.mistral.ai/v1` | Required | No | Loaded dynamically |
| Custom | Any URL | Optional | Depends | Loaded dynamically |

> Any provider implementing the OpenAI `/v1/chat/completions` endpoint is supported. Models are fetched from the provider's `/v1/models` endpoint. The base URL is fully editable for custom setups (different ports, proxies, self-hosted).

When using **Ollama**, the popup shows a green indicator confirming your data stays local.

---

## Keyboard Shortcuts & Context Menu

| Method | Action |
|--------|--------|
| **Click EasyMailAI button** | Opens the popup with all actions |
| **Ctrl+Shift+I** | Opens the popup (same as clicking the button) |
| **Right-click on text** | Context menu with 5 quick actions: Improve, Formalize, Simplify, Shorten, Grammar only. These apply directly without preview. |

---

## Privacy & Security

- **No intermediate servers** - API calls go directly from Thunderbird to your chosen provider
- **Ollama = 100% local** - Your data never leaves your machine
- **API keys stored locally** - In Thunderbird's extension storage only, never transmitted elsewhere
- **Export excludes keys** - Config export/import never includes API credentials
- **No telemetry** - Zero tracking, zero analytics, zero data collection
- **CSP enforced** - Content Security Policy restricts script and connection sources
- **Prompt injection mitigation** - Email content sent to AI is wrapped in clear delimiters to prevent manipulation

---

## Auto-Update

EasyMailAI checks for updates automatically via GitHub Releases. Thunderbird will notify you when a new version is available.

The extension manifest includes an `update_url` pointing to the repository's `updates.json`, which is updated automatically by GitHub Actions on each release.

To update manually: download the latest `.xpi` from [Releases](https://github.com/EasySoft-Tech-SL/easymailai-thunderbird/releases) and install it over the existing version.

---

## Project Structure

```
easymailai/
├── manifest.json                    # Thunderbird MailExtension manifest (MV2)
├── background.js                    # Main orchestrator - message routing, API calls, all handlers
├── updates.json                     # Auto-update manifest for Thunderbird
├── lib/
│   ├── constants.js                 # Shared constants: providers, limits, API defaults, i18n maps
│   ├── i18n-helper.js               # Internationalization: applyI18n(), msg() helper
│   ├── searchable-select.js         # Custom searchable dropdown component
│   ├── api-client.js                # OpenAI-compatible API client with fallback & model fetching
│   ├── text-processor.js            # HTML/plain text handling, signature detection, quoted content
│   └── prompt-manager.js            # 25+ built-in prompts, custom profiles, templates, snippets, learning
├── compose/
│   ├── compose-action.html          # Popup UI with sectioned action grid
│   ├── compose-action.js            # Popup logic: actions, views, tooltips, analysis
│   ├── compose-action.css           # Popup styles with dark mode
│   ├── autocomplete.js              # Ghost text real-time suggestions (compose_scripts)
│   └── autocomplete.css             # Ghost text styles
├── options/
│   ├── options.html                 # Full settings page with all sections
│   ├── options.js                   # Settings logic: CRUD, providers, features, export/import
│   └── options.css                  # Settings styles with dark mode
├── icons/icon.svg                   # Extension icon (SVG)
├── _locales/
│   ├── es/messages.json             # Spanish localization (280+ keys)
│   └── en/messages.json             # English localization (280+ keys)
├── .github/workflows/build.yml      # CI: validates, packages .xpi, creates GitHub Release
├── LICENSE                          # MIT
└── README.md                        # This file
```

## Tech Stack

- **Language:** Pure JavaScript ES2020+ — no frameworks, no bundler, no npm, no dependencies
- **Platform:** Thunderbird MailExtension API (Manifest V2)
- **APIs used:** `compose`, `composeAction`, `storage`, `menus`, `commands`, `accountsRead`
- **Internationalization:** Full i18n with `browser.i18n` API (280+ keys per language)
- **Theming:** Automatic dark mode via `prefers-color-scheme`

---

## Development

```bash
# Clone the repository
git clone https://github.com/EasySoft-Tech-SL/easymailai-thunderbird.git

# Load in Thunderbird for development
# Tools > Developer Tools > Debug Add-ons > Load Temporary Add-on
# Select manifest.json

# Debug
# Ctrl+Shift+J for error console
# Debug Add-ons > Inspect for full DevTools

# After code changes, click "Reload" in Debug Add-ons

# Validate JS syntax
node -c background.js
node -c compose/compose-action.js
node -c options/options.js

# Package as .xpi
git archive --format=zip --output=easymailai.xpi HEAD -- manifest.json background.js updates.json LICENSE lib/ compose/ options/ icons/ _locales/
```

---

## Contributing

Issues and pull requests are welcome. For major changes, please open an issue first to discuss.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## License

[MIT](LICENSE)

---

## About

**EasyMailAI** is developed by [Easysoft Tech S.L.](https://easysoft.es)

- **Author:** Alberto Luque Rivas
- **Email:** desarrollo@easysoft.es
- **Website:** [https://easysoft.es](https://easysoft.es)

---

<p align="center">
  <sub>Built with care by <a href="https://easysoft.es">Easysoft</a></sub>
</p>
