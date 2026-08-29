# Gemini Research Sources

Initial repository search found several existing implementations that can inform Google Gemini support.

## Strong Candidates

### `Joseph19820124/gemini-codeassist-client`

This is the cleanest starting point for Chat2API because it wraps Google's Gemini Code Assist protocol used by official `google-gemini/gemini-cli`.

Observed from README:

- Auth uses Google OAuth with access and refresh tokens.
- Endpoint is `https://cloudcode-pa.googleapis.com/v1internal:streamGenerateContent?alt=sse`.
- Requests use `Authorization: Bearer <google-oauth-token>`.
- Request body contains `model`, optional `project`, `user_prompt_id`, and nested `request.contents`, `systemInstruction`, `tools`, and `generationConfig`.
- Response is SSE with `data:` lines containing `response.candidates[].content.parts[].text`, `finishReason`, and `usageMetadata`.
- Supports token refresh and function calling.
- Credentials should be stored securely; plain files are discouraged for production.

Recommendation: use this path as the primary implementation model for a `google-gemini` provider.

### `grndis/gemini-cli-openai`

This project exposes Gemini CLI OAuth credentials as an OpenAI-compatible API.

Observed from README:

- Credentials live under `~/.gemini/oauth_creds.json` or `~/.gemini/oauth_creds_<account-id>.json`.
- Supports multiple Google accounts, account rotation, streaming, multimodal input, function calling, and token refresh.
- Provides `/v1/chat/completions`, `/v1/models`, and OAuth helper endpoints.

Recommendation: inspect implementation for account rotation, OpenAI-to-Gemini conversion, and SSE conversion patterns.

### `router-for-me/CLIProxyAPI`

Large Go proxy for Gemini CLI, Antigravity, Codex, Claude Code, Grok and others.

Observed from README:

- Supports Gemini, Antigravity, Codex, Claude, and Grok through OAuth login.
- Supports multiple accounts, round-robin balancing, streaming, non-streaming, tool calling, and multimodal input.
- Stores Gemini credentials at `~/.gemini/oauth_creds.json` and Antigravity credentials at `~/.antigravity/oauth_creds.json`.
- Documents OAuth callback ports: Gemini `8085`, Antigravity `8086`, Codex `1455`, Grok CLI `56121`.

Recommendation: delegate targeted source inspection for Gemini and Antigravity provider modules only; avoid copying broad architecture.

### `justlovemaki/AIClient2API`

Large Node.js proxy with Gemini CLI and Antigravity support.

Observed from README:

- Supports Gemini CLI, Antigravity, Codex, Grok, Kiro and provider pools.
- Uses visual configuration and OAuth credential files.
- Mentions Antigravity support through Google internal interfaces.
- Supports provider fallback chains, account pools, health checks, and token auto-refresh.

Recommendation: inspect source for Node/TypeScript-compatible patterns, especially Antigravity OAuth and request translation.

## Riskier Candidate

### `snake-aabb-wtf/geminiweb2api`

Reverse-engineers the Gemini web chat UI into an OpenAI-compatible API using HAR extraction.

Observed from README:

- Requires exporting browser HAR from `https://gemini.google.com` after sending a message.
- Extracts `F_SID`, `AT`, `SN_PARAM`, `BL_PARAM`, `HL`, `UUID`, `HASH`, model family, and thinking mode.
- Supports streaming and multiple model profiles.
- Auth parameters expire and require re-capturing HAR.
- Does not support tools/function calling and is text-only.

Recommendation: keep as fallback or diagnostic reference. Do not make it the primary path unless Code Assist/Gemini CLI OAuth cannot access required chat models.

## Integration Decision

Primary path should be Code Assist / Gemini CLI OAuth because it uses Google's published CLI protocol, supports refresh tokens, and fits Chat2API's account model better than browser HAR credentials.

Secondary path can be Gemini Web HAR import for experiments, but it has higher account-risk, expiry, and maintenance cost.

Antigravity should be researched as a separate provider or secondary Gemini-compatible account type because its credential location and quota semantics differ from Gemini CLI.
