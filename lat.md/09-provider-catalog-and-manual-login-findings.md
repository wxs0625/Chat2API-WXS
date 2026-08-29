# Provider Catalog And Manual Login Findings

This file tracks the built-in Chat2API providers and manual login findings from live provider UI checks.

## Built-In Provider Catalog

| Provider ID | Name | Login URL | API Base | Auth type | Credential fields | Default models |
| --- | --- | --- | --- | --- | --- | --- |
| `deepseek` | DeepSeek | `https://chat.deepseek.com` | `https://chat.deepseek.com/api` | `userToken` | `token` | `deepseek-v4-flash`, `deepseek-v4-pro` |
| `glm` | GLM / Zhipu Qingyan | `https://chatglm.cn` | `https://chatglm.cn/api` | `refresh_token` | `refresh_token` | `GLM-5.3`, `GLM-5.1` |
| `kimi` | Kimi (K3) | `https://www.kimi.ai` | `https://www.kimi.ai` | `jwt` | `token` | `Kimi-K3`, `Kimi-K2.6` |
| `minimax` | MiniMax | `https://agent.minimaxi.com` | `https://agent.minimaxi.com` | `jwt` | `token`, optional `realUserID` | `MiniMax-M3`, `MiniMax-M2.7` |
| `mimo` | Mimo / Xiaomi AI Studio | `https://aistudio.xiaomimimo.com` | `https://aistudio.xiaomimimo.com` | `cookie` | `service_token`, `user_id`, `ph_token` | `MiMo-V2.5-Pro`, `MiMo-V2.5`, `MiMo-V2-Flash` |
| `perplexity` | Perplexity | `https://www.perplexity.ai` | `https://www.perplexity.ai` | `cookie` | `sessionToken` | `Auto` |
| `qwen` | Qwen / Tongyi | `https://www.qianwen.com` | `https://chat2.qianwen.com` | `tongyi_sso_ticket` | `ticket` | `Qwen3.8-Max`, `Qwen3.6`, `Qwen3.7-Max`, `Qwen3.5-Flash`, `Qwen3-Max`, `Qwen3-Max-Thinking-Preview`, `Qwen3-Coder` |
| `qwen-ai` | Qwen AI International | `https://chat.qwen.ai` | `https://chat.qwen.ai` | `jwt` | `token`, optional `cookies` | `Qwen3.8-Max`, `Qwen3.7-Plus`, `Qwen3.7-Max`, `Qwen3.6-Plus` (live `/api/models` on 2026-08-22 returned only `qwen3.8-max`, `qwen3.7-plus`; older models kept per user request) |
| `zai` | Z.ai | `https://chat.z.ai` | `https://chat.z.ai/api` | `jwt` | `token`, optional `captcha_verify_param` | `GLM-5.3-Flash`, `GLM-5.3`, `GLM-5.2`, `GLM-5.1`, `GLM-5-Turbo`, `GLM-5V-Turbo`, `GLM-5`, `GLM-4.7` |

## Manual Login Findings

| Provider ID | Login URL | Gmail/Google status | Finding | Source |
| --- | --- | --- | --- | --- |
| `deepseek` | `https://chat.deepseek.com` | Not available | Google/Gmail login option is not present in the current live UI. | Manual live UI check by project owner. |
| `glm` | `https://chatglm.cn` | Not available | Gmail login is not available; login is available only through Chinese phone number or WeChat. | Manual live UI check by project owner. |
| `kimi` | `https://www.kimi.ai` | Available | K3 upgrade moved international users to kimi.ai (Google/email/phone login); `www.kimi.com` now serves mainland China only (phone/QR). Gmail login is available on kimi.ai. | Manual live UI check by project owner, 2026-08 K3 upgrade. |
| `minimax` | `https://agent.minimaxi.com` | Not available | Gmail login is not available. | Manual live UI check by project owner. |
| `mimo` | `https://aistudio.xiaomimimo.com` | Unknown | Site returned 404 during manual check, so login method could not be verified. | Manual live UI check by project owner. |
| `perplexity` | `https://www.perplexity.ai` | Available | Gmail login is available. | Manual live UI check by project owner. |
| `qwen` | `https://www.qianwen.com` | Not available | Gmail login is not available. | Manual live UI check by project owner. |
| `qwen-ai` | `https://chat.qwen.ai` | Available | Gmail login is available. Need to verify whether `Qwen3.7-Max` is accessible for Gmail-authenticated accounts. | Manual live UI check by project owner. |
| `zai` | `https://chat.z.ai` | Available | Gmail login is available. JWT is supported; captcha-risk conversations can refresh short-lived `captcha_verify_param` through browser-assisted capture. `GLM-5.2` extracted from live frontend (agent-mode default model id, lowercase) and `GLM-5.3-Flash` from the live site title/toast on 2026-08 refresh; frontend version bumped to `prod-fe-1.1.92`. | Manual live UI check by project owner plus `479bc2d` implementation and frontend re-scrape. |

## Follow-Up Provider Work

1. `qwen-ai`: verify live model availability for `Qwen3.7-Max` after Gmail login and compare it with the current configured model mapping in `src/main/providers/builtin/qwen-ai.ts`.
2. `zai`: RESOLVED on 2026-08 refresh — `GLM-5.3-Flash` (uppercase request id, site flagship) and `GLM-5.2` (lowercase request id, agent-mode default) added to `src/main/providers/builtin/zai.ts`, the Z.ai proxy adapter mapping table, docs, and tests. Captcha-risk mitigation now uses browser-assisted `captcha_verify_param` capture.
3. `mimo`: re-check the URL or provider status because `https://aistudio.xiaomimimo.com` returned 404 during manual login verification.
4. UI should prioritize Gmail-capable providers: `kimi`, `perplexity`, `qwen-ai`, and `zai`.
5. UI should clearly mark `glm`, `minimax`, and `qwen` as not Gmail-capable based on current manual checks.

## Reasoning Effort Pass-Through (2026-08)

Official web clients were audited for thinking-level controls; adapters now forward the OpenAI-style `reasoning_effort` value where a real effort level exists:

- `kimi`: official proto `ChatRequestOptions.reasoning_effort` (`LOW`/`MEDIUM`/`HIGH`/`XHIGH`/`MAX`) plus `context_length`; `createKimiChatPayload` in `src/main/proxy/adapters/providerModelOptions.ts` maps `low→LOW`, `medium→MEDIUM`, `high→HIGH`, `xhigh→XHIGH`, `max→MAX` and implies `thinking:true`.
- `zai`: web client sends `features.reasoning_effort` (`low`/`high`/`max`, default `max`) alongside `enable_thinking`; adapter maps `medium→high` and only adds the field when an explicit level is given.
- `deepseek` / `glm` / `qwen` (domestic): official sites only expose boolean/mode toggles (`thinking_enabled`, `chat_mode:"zero"`), already implemented correctly.
- `qwen-ai`: official site only exposes a Thinking/Fast/Auto boolean switch; `thinking_budget` stays an additive optional field.
- `minimax` / `mimo`: effort control code path not located yet; adapters keep boolean-only behavior.

## GLM Notes

`glm` in Chat2API targets Zhipu Qingyan at `chatglm.cn` and currently supports `GLM-5.3` and `GLM-5.1` through a `refresh_token` flow. The app validates tokens through `/chatglm/user-api/user/refresh`, rejects guest accounts, and accepts accounts that expose phone or email in user info.

Chat2API also includes `zai`, which is a separate provider endpoint but uses GLM-family models (`GLM-5.3-Flash`, `GLM-5.3`, `GLM-5.2`, `GLM-5.1`, `GLM-5-Turbo`, `GLM-5V-Turbo`, `GLM-5`, `GLM-4.7`). Treat `glm` and `zai` as separate account/login surfaces even though both are GLM-family services.

## Limit Information

The repository does not document official GLM daily/monthly quotas or rate limits. Limits must be verified through the live provider UI, provider terms, or observed API responses such as HTTP `429`, quota messages, or account status responses.
