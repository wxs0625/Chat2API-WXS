# Project Map

Chat2API Manager is an Electron desktop app that exposes provider chat UIs and web APIs through an OpenAI-compatible local proxy.

## Runtime Layers

- `src/main/` owns Electron main process, persistent store, OAuth/login flows, and the Koa proxy server.
- `src/main/proxy/` receives OpenAI-compatible requests, chooses accounts, maps models, and forwards calls to provider adapters.
- `src/main/providers/builtin/` defines built-in provider metadata, credential fields, endpoints, and model mappings.
- `src/main/oauth/` extracts and validates user tokens through manual token input or in-app browser login.
- `src/renderer/src/` owns the React UI, provider/account management screens, logs, settings, and i18n.
- `tests/` contains Node/Vitest-style coverage for providers, tool calling, request logs, renderer helpers, source artifacts, and skills.

## Provider Add Path

A built-in provider normally touches these files:

- Provider config: `src/main/providers/builtin/<provider>.ts` and `src/main/providers/builtin/index.ts`.
- Store type registration: `src/main/store/types.ts` through the built-in provider export path.
- OAuth/login adapter: `src/main/oauth/adapters/<provider>.ts` and `src/main/oauth/adapters/index.ts`.
- Proxy adapter: `src/main/proxy/adapters/<provider>.ts`, optional stream handler, and `src/main/proxy/adapters/index.ts`.
- Forwarding dispatch: `src/main/proxy/forwarder.ts`.
- UI copy/icons: `src/renderer/src/i18n/locales/*.json`, `src/renderer/src/components/providers/ProviderCard.tsx`, and optional `src/assets/providers/<provider>.svg`.
- Provider docs/tests: `docs/providers/<provider>.md` and targeted tests under `tests/providers/`.

## Current Built-In Providers

The current built-in provider set is DeepSeek, GLM, Kimi, Mimo, MiniMax, Perplexity, Qwen, Qwen AI, and Z.ai.

## Known Gaps For This Fork

- No Google Gemini chat provider is registered.
- Locales only include English and Simplified Chinese.
- Login UX is provider-specific and does not prioritize Gmail-capable paths.
- Some Chinese providers require phone-number flows that cannot be solved without accessible phone verification.
