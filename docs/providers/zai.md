# Z.ai

| 项目 | 说明 |
| --- | --- |
| 供应商 ID | zai |
| 官网 | https://chat.z.ai |
| API Base | https://chat.z.ai/api |
| 认证 | JWT Token |
| 凭据字段 | `token`，可选 `captcha_verify_param` |
| Google / Gmail 登录 | 支持 |
| 当前状态 | JWT 可用；验证码风控场景需要浏览器辅助捕获 `captcha_verify_param` |

## 默认模型

| 显示名称 | 实际模型 ID |
| --- | --- |
| GLM-5.3-Flash | GLM-5.3-Flash |
| GLM-5.3 | GLM-5.3 |
| GLM-5.2 | glm-5.2 |
| GLM-5.1 | GLM-5.1 |
| GLM-5-Turbo | GLM-5-Turbo |
| GLM-5V-Turbo | GLM-5v-Turbo |
| GLM-5 | glm-5 |
| GLM-4.7 | glm-4.7 |

## 适配状态

Z.ai 的 JWT token 可通过网页登录后提取。对话接口 `/api/v2/chat/completions` 在部分账号/环境下会触发前端验证码风控，返回 `FRONTEND_CAPTCHA_REQUIRED`。这种情况下需要让真实 Z.ai 网页自行运行 CaptchaJS/VerifyCaptchaV3，并捕获短时有效的 `captcha_verify_param`。

当前实现支持浏览器辅助捕获：使用应用内浏览器登录 Z.ai 后，如果界面提示需要验证码，请在 Z.ai 登录窗口里发送一条测试消息。应用会从真实网页发出的 `/api/v2/chat/completions` 请求体中捕获 `captcha_verify_param`，并和 JWT 一起保存到账号凭据。该参数通常短时有效，失效后需要重新通过浏览器窗口刷新。

已完成的适配：流式对话、非流式对话、多轮会话、账号级清理对话记录、GLM 系列模型映射、`X-FE-Version: prod-fe-1.1.92`、`X-Region: domestic`、浏览器环境 query 参数、token 认证头、可选 `captcha_verify_param` 注入。

## 思考模式（reasoning_effort）

官网网页端在 `features` 中发送 `enable_thinking` 布尔开关，以及思考强度等级 `reasoning_effort`（取值 `low` / `high` / `max`，默认 `max`）。请求参数 `reasoning_effort` 会映射到该等级：

| 请求值 | 官网等级 |
| --- | --- |
| `low` | `low` |
| `medium` | `high` |
| `high` / `max` | `high` / `max` |
| `false` | 关闭思考（`enable_thinking: false`，不发送等级） |

默认情况下思考开启且不发送等级字段（等价于官网默认 `max`）。仅当显式指定等级字符串时才附加该字段。

## 教程

1. 在供应商管理中选择 Z.ai，并优先使用浏览器登录。
2. 登录 `chat.z.ai`；Gmail 登录可用时选择 Google/Gmail 登录。
3. 如果 Z.ai 页面要求验证码或首次对话触发风控，请在登录窗口里发送一条测试消息。
4. 应用会自动捕获 JWT token；如果网页请求携带 `captcha_verify_param`，也会一并保存。
5. 如果后续再次出现 `FRONTEND_CAPTCHA_REQUIRED`，重新执行浏览器登录/测试消息流程刷新短时验证码参数。
