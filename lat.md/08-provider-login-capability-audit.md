# Provider Login Capability Audit

Current built-in providers rely on manual token or cookie extraction; this repository does not currently implement first-class Gmail/Google OAuth for any Chinese provider.

## Capability Matrix

| Provider | Adapter auth methods | Credential fields | In-app extraction | Gmail/Google status | Evidence | Recommended UI label |
| --- | --- | --- | --- | --- | --- | --- |
| `deepseek` | `manual` | `token` | Yes, token extraction config points to `https://chat.deepseek.com` | Unknown | `src/main/oauth/adapters/index.ts`, `src/main/providers/builtin/deepseek.ts`, `src/main/oauth/tokenExtractionConfig.ts` | Manual token. Gmail support not verified. |
| `glm` | `manual` | `refresh_token` | Yes, token extraction config points to `https://chatglm.cn` | Unknown | `src/main/oauth/adapters/glm.ts`, `src/main/providers/builtin/glm.ts`, `src/main/oauth/tokenExtractionConfig.ts` | Manual refresh token. Login method not verified. |
| `kimi` | `manual` | `token` / `kimi-auth` cookie value | Yes, token extraction config points to `https://www.kimi.ai` (K3; legacy `www.kimi.com` kept as mainland-China fallback) | Unknown | `src/main/oauth/adapters/kimi.ts`, `src/main/providers/builtin/kimi.ts`, `src/main/oauth/tokenExtractionConfig.ts` | Manual token or cookie. In-app login auto-captures `kimi-auth` cookie on kimi.ai. Gmail support not verified. |
| `mimo` | `manual`, `cookie` | `service_token`, `user_id`, `ph_token` | Yes, cookie extraction config points to Xiaomi Mimo AI Studio | Unknown, likely Xiaomi account-bound | `src/main/oauth/adapters/mimo.ts`, `src/main/providers/builtin/mimo.ts`, `src/main/oauth/tokenExtractionConfig.ts` | Cookie login. Xiaomi account required. |
| `minimax` | `manual` | `token`, optional `realUserID` | Yes, token extraction config points to `https://agent.minimaxi.com` | Unknown | `src/main/oauth/adapters/minimax.ts`, `src/main/providers/builtin/minimax.ts`, `src/main/oauth/tokenExtractionConfig.ts` | Manual JWT token. Gmail support not verified. |
| `perplexity` | `manual`, `cookie` | `sessionToken` | Yes, cookie extraction config points to `https://www.perplexity.ai` | Likely supported by provider UI, but not encoded in repo | `src/main/oauth/adapters/perplexity.ts`, `src/main/providers/builtin/perplexity.ts`, `src/main/oauth/tokenExtractionConfig.ts` | Cookie login. Google login may work if Perplexity account uses Google. |
| `qwen` | `manual`, `cookie` | `ticket` (`tongyi_sso_ticket`) | Yes, cookie extraction config points to `https://www.qianwen.com` | Unknown, likely Alibaba/Tongyi SSO-bound | `src/main/oauth/adapters/qwen.ts`, `src/main/providers/builtin/qwen.ts`, `src/main/oauth/tokenExtractionConfig.ts` | Cookie login. Alibaba/Tongyi SSO required. |
| `qwen-ai` | `manual` | `token`, optional `cookies` | Yes, token extraction config points to `https://chat.qwen.ai` | Unknown | `src/main/oauth/adapters/qwen-ai.ts`, `src/main/providers/builtin/qwen-ai.ts`, `src/main/oauth/tokenExtractionConfig.ts` | Manual token. International site; login method not verified. |
| `zai` | `manual` | `token`, optional `captcha_verify_param` | Yes, token extraction config points to `https://chat.z.ai` | Unknown | `src/main/oauth/adapters/zai.ts`, `src/main/providers/builtin/zai.ts`, `src/main/oauth/tokenExtractionConfig.ts` | Manual JWT token. May require CAPTCHA parameter. |

## Findings

- `src/main/oauth/adapters/index.ts` reports only `manual` for most providers; `mimo`, `perplexity`, and `qwen` also expose `cookie`.
- Provider configs under `src/main/providers/builtin/` describe browser DevTools token or cookie extraction, not provider-managed OAuth.
- `src/main/oauth/tokenExtractionConfig.ts` supports in-app login windows for extracting tokens/cookies from provider sites, but this is not the same as Gmail OAuth support.
- `src/main/oauth/guides.ts` contains manual login guides for a subset of providers and should be extended with login capability labels.
- The code does not include evidence that Chinese providers support Google login; those should remain `unknown` until verified manually in the live provider UI.

## Recommended Changes

1. Add a `loginCapability` or `loginNotes` metadata field to built-in provider configs so UI can show `Manual token`, `Cookie`, `Phone/SSO required`, `Google login may work`, or `Unknown`.
2. Surface the label in `AddProviderDialog`, `AddAccountDialog`, `ProviderCard`, and `LoginGuideDialog` before users open a login window.
3. Update `docs/providers/*.md` with a short `Login support` section and current extraction method.
4. Prefer Perplexity and future Google Gemini for Gmail/Google-account workflows; do not promise Gmail support for Chinese SSO providers without manual verification.
5. Keep phone-only/CAPTCHA-heavy flows explicit and avoid any bypass automation.
