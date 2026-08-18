# 简介

ku-utils 是前端公共库 Monorepo，基于 pnpm workspace + Turborepo 构建，包发布到 npm（`@ku-utils/*`）。

管理端 starter 见本仓 `apps/kv3-admin`（Vue 3 + Element Plus，workspace 消费 utils / hooks / custom-columns）。

## 包含什么

| 分类     | 包名                       | 说明                                                  |
| -------- | -------------------------- | ----------------------------------------------------- |
| 工程配置 | @ku-utils/eslint-config    | ESLint 配置（Vue 2/3/Nuxt 4）                         |
| 工程配置 | @ku-utils/prettier-config  | Prettier 配置                                         |
| 工程配置 | @ku-utils/tsconfig         | TypeScript 配置                                       |
| 工程配置 | @ku-utils/stylelint-config | Stylelint 配置                                        |
| 工具库   | @ku-utils/utils            | 纯函数工具库                                          |
| 工具库   | @ku-utils/hooks            | Vue 3 Composables                                     |
| 工具库   | @ku-utils/directives       | Vue 3 自定义指令                                      |
| 工具库   | @ku-utils/request          | Axios HTTP 请求封装                                   |
| 工具库   | @ku-utils/constants        | 枚举/常量/正则                                        |
| 工具库   | @ku-utils/types            | 公共 TypeScript 类型                                  |
| 工具库   | @ku-utils/i18n             | 多语言工具                                            |
| 设计     | @ku-utils/design-tokens    | 设计令牌                                              |
| 组件库   | @ku-utils/ui               | Vue 3 业务组件库                                      |
| 组件库   | @ku-utils/ui-vue2          | Vue 2 业务组件库                                      |
| 集成     | @ku-utils/nuxt-module      | Nuxt 4 集成模块                                       |
| 业务 SDK | @ku-utils/marketing        | 营销追踪（Adjust/Appsflyer/Pixel/落地页/scheme 唤起） |
| 业务 SDK | @ku-utils/report           | 通用埋点上报 SDK（CoreTracker）                       |
| 业务 SDK | @ku-utils/landing-report   | 落地页埋点 SDK（继承 CoreTracker）                    |
| 业务 SDK | @ku-utils/pay              | Web 支付 SDK（HelaPay 体系，微信 JSAPI）              |
| CLI      | @ku-utils/cli              | 团队 CLI 工具                                         |
| CLI      | @ku-utils/create-app       | 项目创建工具                                          |

## 技术栈

- **包管理**: pnpm v10
- **构建编排**: Turborepo v2
- **版本管理**: Changesets
- **发布目标**: npmjs.org（`@ku-utils/*` public）
