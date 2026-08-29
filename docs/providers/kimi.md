# Kimi

| 项目 | 说明 |
| --- | --- |
| 供应商 ID | kimi |
| 官网 | https://www.kimi.ai （K3 新站，中国大陆以外用户） |
| API Base | https://www.kimi.ai |
| 认证 | JWT Token（`kimi-auth` Cookie 或 Authorization Bearer） |
| 凭据字段 | `token` |
| Google / Gmail 登录 | 支持 |

> 说明：Kimi 已升级至 K3，中国大陆以外用户统一使用 `www.kimi.ai`；
> `www.kimi.com` 仅面向中国大陆用户（手机号/扫码登录）。代码对两个域名均保持兼容。

## 默认模型

| 显示名称 | 实际模型 ID |
| --- | --- |
| Kimi-K3 | kimi-k3 |
| Kimi-K2.6 | kimi-k2.6 |

## 适配状态

已适配：Connect JSON 对话接口、流式对话、非流式对话、多轮会话、账号级批量清理对话记录、联网搜索和思考参数。

后续验证：官网 `ChatService` 协议字段、K2 系列场景 ID、批量删除接口的返回格式。

## 思考模式（reasoning_effort）

请求参数 `reasoning_effort`（或 `reasoningEffort`）会透传到官网的 `ChatRequestOptions.reasoning_effort` 枚举。映射规则：

| 请求值 | 官网枚举 |
| --- | --- |
| `low` / `minimal` | `LOW` |
| `medium` | `MEDIUM` |
| `high` | `HIGH` |
| `xhigh` | `XHIGH` |
| `max` | `MAX` |

指定任意等级即隐含开启思考（`options.thinking = true`）。不传该参数时仅按 `enableThinking` / 模型名（`think`、`r1`）决定是否思考，不发送枚举字段。

## 教程

1. 登录 `www.kimi.ai`（中国大陆用户可访问 `www.kimi.com`）。
2. 应用内登录会在登录后自动捕获 `kimi-auth` Cookie；也可打开 DevTools -> Application -> Cookies，复制 `kimi-auth` 值，或复制可用 JWT/refresh token。
3. 在供应商管理中添加 Kimi 账号，填入 `token`。
4. 默认模型为 `Kimi-K3` 和 `Kimi-K2.6`；旧的 `Kimi-K2.5` 不再作为内置默认模型。
