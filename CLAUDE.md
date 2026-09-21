# ku-utils — 前端团队 Monorepo 公共库

## 项目定位

前端团队的共享基础设施，统一沉淀工具库、组件库、工程配置、CLI 工具。覆盖三种项目类型：Vue 2、Vue 3、Nuxt 4 + Vue 3。

## 技术栈（精确版本）

| 工具       | 版本    | 说明                                         |
| ---------- | ------- | -------------------------------------------- |
| Node.js    | >= 20   | 必须                                         |
| pnpm       | 10.8.0  | 包管理器（严格模式，shamefully-hoist=false） |
| Turborepo  | ^2.5.0  | 构建编排，任务缓存                           |
| TypeScript | ^5.9.3  | 全局统一版本                                 |
| ESLint     | ^9.27.0 | Flat Config（v9 新格式）                     |
| Prettier   | ^3.5.3  | 通过 @ku-utils/prettier-config 统一          |
| Changesets | ^2.29.4 | 版本管理与发布                               |
| Husky      | ^9.1.7  | Git hooks                                    |
| tsup       | ^8.5.0  | 纯 TS 库的构建工具                           |
| Vite       | ^6.3.5  | Vue 组件库的构建工具                         |
| Vue 3      | ^3.5.16 | Vue 3 组件和 hooks                           |
| Vue 2      | ^2.7.0  | Vue 2 组件库（维护模式）                     |
| Nuxt       | ^3.17.3 | Nuxt 模块                                    |
| VitePress  | ^1.6.3  | 文档站                                       |

## 目录结构

```
ku-utils/
├── packages/           # 可发布的 npm 包（16 个）
│   ├── eslint-config/     构建: tsup       ESLint Flat Config（含 vue2/vue3/nuxt4 子配置）
│   ├── prettier-config/   构建: 无（纯JSON） Prettier 共享配置
│   ├── tsconfig/          构建: 无（纯JSON） TypeScript 配置集（base/library/vue3/vue2/nuxt4）
│   ├── stylelint-config/  构建: tsup       Stylelint 配置
│   ├── utils/             构建: tsup       纯函数工具库（零框架依赖）
│   ├── hooks/             构建: tsup       Vue 3 Composables（useLoading/useCountdown/useClipboard...）
│   ├── directives/        构建: tsup       Vue 3 自定义指令（vLoading/vPermission/vDebounce）
│   ├── skin/              构建: 自定义脚本 统一皮肤（--ku-* 语义变量 + Element Plus --el-* 桥接）
│   ├── constants/         构建: tsup       常用正则（REGEX）
│   ├── types/             构建: tsup       公共 TypeScript 类型
│   ├── i18n/              构建: tsup       多语言工具（createI18n/detectBrowserLocale）
│   ├── ui/                构建: Vite       Vue 3 组件库（DuButton/DuModal/DuEmpty/DuStatusTag）
│   ├── ui-vue2/           构建: Vite       Vue 2 组件库（维护模式）
│   ├── nuxt-module/       构建: nuxt-module-builder   Nuxt 4 集成模块
│   ├── custom-columns/    构建: tsup       Vue 3 自定义列
│   └── v2-custom-columns/ 构建: tsup       Vue 2 自定义列
├── tools/              # CLI 工具（2 个）
│   ├── cli/               @ku-utils/cli 团队命令行工具
│   └── create-app/        @ku-utils/create-app 项目脚手架
├── apps/               # Playground 应用（不发布，仅开发验证用）
│   ├── playground-vue3/   Vue 3 + Vite 验证应用
│   ├── playground-vue2/   Vue 2 + Vite 验证应用
│   ├── playground-nuxt4/  Nuxt 4 验证应用
│   └── kv3-admin/         Vue 3 + Element Plus 管理端 starter
├── docs/               # VitePress 文档站
├── .cursor/rules/      # AI 开发规范（4 个 .mdc 文件）
├── .vscode/settings.json  # IDE 配置
├── turbo.json          # Turborepo 任务配置
├── pnpm-workspace.yaml # pnpm workspace 声明
├── .npmrc              # pnpm hoist/peer 策略
├── commitlint.config.js
└── eslint.config.js    # 根 ESLint（使用 vue3 配置 + 关闭 vue/block-lang 兼容 Vue 2）
```

## 发布与注册表

- **scope**: `@ku-utils`
- **registry**: npmjs.org（public）
- **Git remote**: `git@github.com:RyenToretto/ku-utils.git`
- **发版**: Changesets + `.github/workflows/release.yml`（`NPM_TOKEN`）

消费方直接 `pnpm add @ku-utils/<pkg>`。

## 常用命令

```bash
pnpm install              # 安装依赖
pnpm build                # 构建所有包（Turborepo 编排，自动处理依赖顺序）
pnpm dev                  # 启动所有 dev 模式
pnpm lint                 # ESLint 检查
pnpm lint:fix             # ESLint 自动修复
pnpm format               # Prettier 格式化
pnpm test                 # 运行测试
pnpm typecheck            # TypeScript 类型检查

# 过滤器
pnpm --filter @ku-utils/utils build       # 构建单个包
pnpm --filter @ku-utils/docs dev          # 启动文档站开发
pnpm --filter @ku-utils/playground-vue3 dev  # Vue 3 Playground
pnpm dev:admin                                # kv3-admin starter

# 发布
pnpm changeset            # 创建变更记录
pnpm version-packages     # 更新版本号 + CHANGELOG
pnpm release              # 构建 packages+tools 并 publish 到 npm
```

## 关键设计决策

### tsconfig 策略

- `base.json` 设置 `noEmit: true`，防止 apps/ 下的 TS 文件生成冗余 .js/.d.ts
- `library.json` 覆盖为 `noEmit: false` + `declaration: true`，让 tsup/Vite 正常生成类型

### ESLint 配置分层

- `base.js` → TypeScript + import 排序 + 基础规则
- `vue2.js` / `vue3.js` / `nuxt4.js` → 分别继承 base 并添加 Vue 特定规则
- 根 `eslint.config.js` 使用 vue3 配置但关闭 `vue/block-lang`（兼容 Vue 2 项目的 lint-staged）
- 已解决的冲突：ESLint stylistic vs Prettier（移除了 semi/comma-dangle/indent，由 Prettier 统管）

### UI 组件库导出

- `@ku-utils/ui` 和 `@ku-utils/ui-vue2` 只使用**命名导出**（`export function install(app)`），没有 `export default`
- 消费方：`import { install as installUI } from '@ku-utils/ui'; app.use(installUI);`
- 原因：避免 Rollup 的 mixed named/default export 警告，提升 tree-shaking

### 统一皮肤 `@ku-utils/skin`

- 唯一语义变量前缀 `--ku-*`；`packages/ui`、`ui-vue2`、`directives`、`custom-columns`、`v2-custom-columns` 全部消费它，组件里写成 `var(--ku-*, <lark 浅色 fallback>)`，不把皮肤 CSS 打进组件产物
- 皮肤是数据（`src/themes/*.js`），CSS 是产物：`scripts/generate.mjs` 用 `mix()` 从品牌基色现算 Element Plus 的 `--el-color-*` 完整色阶，不手写第二套色板
- Element Plus 结构类变量（`--el-bg-color` 等）统一写成 `var(--ku-*)` 转发，只需在 `:root` 声明一次，`html.dark` 覆写对应 `--ku-*` 即可联动
- 包默认导出是 `lark`；`kv3-admin` 默认 `@ku-utils/skin/tome`。另有备选皮肤数据（`breeze`/`dusk`/`ember`/`glen`/`hextech`/`honey`/`indigo`/`iris`/`orchid`/`sky`），尚未在其它应用启用；变量契约见 [`packages/skin/TOKEN.md`](packages/skin/TOKEN.md)
- `apps/*` 下不应该有自己的皮肤定义，统一来自 `packages/skin`；`kv3-admin` 已全量直连 `--ku-*`

### pnpm strict hoisting

- `shamefully-hoist=false`：严格模式，包必须显式声明依赖
- 常见坑：VitePress 需要显式安装 `vue`；根目录 lint-staged 需要显式安装 `@ku-utils/eslint-config`

## Git 提交规范

```
type(scope): 中文描述
```

- type/scope 保持英文，描述**必须中文**
- type: feat / fix / docs / style / refactor / perf / test / build / ci / chore / revert / release
- scope: 包名（如 utils / hooks / ui）
- 示例: `feat(utils): 新增货币格式化函数`
- 由 commitlint + husky pre-commit hook 强制执行
- lint-staged 会依次执行 eslint --fix → prettier --write

## Vue SFC 规范

- 块顺序：`<template>` → `<script>` → `<style>`（由 `vue/block-order` ESLint 规则强制）
- Vue 3 必须使用 `<script setup lang="ts">`
- CSS 禁止 `&-suffix` 类名拼接（`&.modifier` 允许）

## 关联项目

- **kv3-admin**: `apps/kv3-admin`，本仓 Vue 3 管理端 starter，workspace 消费 `@ku-utils/*`

## 已知注意事项

1. `.pnpm-store` 不要提交到 Git（已在 .gitignore）
2. apps/ 下不应生成 .js/.d.ts 文件（由 tsconfig base.json 的 noEmit: true 控制）
3. Nuxt 4 playground 的类型需要 `nuxt prepare` 生成 `.nuxt/` 目录
4. 根目录的 `eslint.config.js` 关闭了 `vue/block-lang`，是刻意的（兼容 Vue 2）
5. 文档站本期不强制上线；本地 `pnpm start` 即可预览，部署见 `docs/deploy-vitepress.md`
