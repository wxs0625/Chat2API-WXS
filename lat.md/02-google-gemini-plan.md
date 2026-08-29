# Google Gemini Provider Plan

Google Gemini support should be implemented as a first-class built-in provider, not as a generic custom endpoint.

## Target Capabilities

- Use Google account-backed Gemini chat access when technically feasible.
- Convert OpenAI chat completion requests into Gemini chat requests.
- Support streaming responses if the discovered Gemini route exposes server-sent or chunked events.
- Expose stable model names for local clients, mapped to Google/Gemini internal model identifiers.
- Keep authentication data encrypted in the existing account store.

## Research Inputs

Research should compare existing implementations for:

- Gemini web chat request format and session lifecycle.
- Gemini CLI OAuth/token storage and request path.
- Antigravity CLI authentication and model request path.
- Google AI Studio or official Gemini API behavior only as a fallback, because official API keys are not the same as paid chat account access.

## Likely Implementation Files

- `src/main/providers/builtin/google-gemini.ts`
- `src/main/oauth/adapters/google-gemini.ts`
- `src/main/proxy/adapters/google-gemini.ts`
- `src/main/proxy/adapters/google-gemini-stream.ts` if streaming is separate.
- `src/main/oauth/adapters/index.ts`
- `src/main/providers/builtin/index.ts`
- `src/main/proxy/adapters/index.ts`
- `src/main/proxy/forwarder.ts`
- `src/renderer/src/i18n/locales/en-US.json`
- `src/renderer/src/i18n/locales/zh-CN.json`
- `src/renderer/src/i18n/locales/ru-RU.json`
- `docs/providers/google-gemini.md`
- `tests/providers/google-gemini*.test.*`

## Open Questions

- Which account token is sufficient for Gemini chat: cookies, OAuth access token, refresh token, or a CLI credential file?
- Does Gemini web chat require anti-CSRF tokens, build IDs, botguard/proof tokens, or rotating headers?
- Can multiple Google accounts be isolated cleanly inside the current account model?
- Does the provider need a browser profile import flow, an in-app login flow, or a manual credential-file import flow?
