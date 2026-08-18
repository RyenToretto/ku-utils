# 简介

ku-utils 是前端公共库 Monorepo，基于 pnpm workspace + Turborepo 构建，包发布到 npm（`@ku-utils/*`）。

管理端 starter 见本仓 `apps/kv3-admin`（Vue 3 + Element Plus，workspace 消费 utils / hooks / custom-columns）。

## 包含什么

| 分类     | 包名                        | 说明                          |
| -------- | --------------------------- | ----------------------------- |
| 工程配置 | @ku-utils/eslint-config     | ESLint 配置（Vue 2/3/Nuxt 4） |
| 工程配置 | @ku-utils/prettier-config   | Prettier 配置                 |
| 工程配置 | @ku-utils/tsconfig          | TypeScript 配置               |
| 工程配置 | @ku-utils/stylelint-config  | Stylelint 配置                |
| 工具库   | @ku-utils/utils             | 纯函数工具库                  |
| 工具库   | @ku-utils/hooks             | Vue 3 Composables             |
| 工具库   | @ku-utils/directives        | Vue 3 自定义指令              |
| 工具库   | @ku-utils/constants         | 常用正则                      |
| 工具库   | @ku-utils/types             | 公共 TypeScript 类型          |
| 工具库   | @ku-utils/i18n              | 多语言工具                    |
| 组件库   | @ku-utils/ui                | Vue 3 业务组件库              |
| 组件库   | @ku-utils/ui-vue2           | Vue 2 业务组件库              |
| 组件库   | @ku-utils/custom-columns    | Vue 3 表格自定义列            |
| 组件库   | @ku-utils/v2-custom-columns | Vue 2 表格自定义列            |
| 集成     | @ku-utils/nuxt-module       | Nuxt 4 集成模块               |
| CLI      | @ku-utils/cli               | 团队 CLI 工具                 |
| CLI      | @ku-utils/create-app        | 项目创建工具                  |

## 技术栈

- **包管理**: pnpm v10
- **构建编排**: Turborepo v2
- **版本管理**: Changesets
- **发布目标**: npmjs.org（`@ku-utils/*` public）
