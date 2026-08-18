# 贡献指南

欢迎参与 ku-utils 前端 Monorepo 公共库的开发。本文档面向团队所有成员，说明从环境搭建到提交代码的完整流程。

## 前置条件

| 工具    | 版本要求  | 说明                          |
| ------- | --------- | ----------------------------- |
| Node.js | >= 20.0.0 | 推荐使用 LTS 版本             |
| pnpm    | >= 10.0.0 | 包管理器，不要使用 npm / yarn |
| Git     | >= 2.30   | 版本管理                      |

## 一、克隆与安装

```bash
git clone git@github.com:RyenToretto/ku-utils.git
cd ku-utils
pnpm install
```

> 依赖从 npm 安装。公开包装在 npmjs.org，无需为 `@ku-utils` 单独配置 registry。

## 二、项目结构

```
ku-utils/
├── packages/               # 所有公共包
│   ├── eslint-config/      # @ku-utils/eslint-config
│   ├── prettier-config/    # @ku-utils/prettier-config
│   ├── tsconfig/           # @ku-utils/tsconfig
│   ├── stylelint-config/   # @ku-utils/stylelint-config
│   ├── utils/              # @ku-utils/utils
│   ├── hooks/              # @ku-utils/hooks
│   ├── directives/         # @ku-utils/directives
│   ├── constants/          # @ku-utils/constants
│   ├── types/              # @ku-utils/types
│   ├── i18n/               # @ku-utils/i18n
│   ├── ui/                 # @ku-utils/ui（Vue 3）
│   ├── ui-vue2/            # @ku-utils/ui-vue2（Vue 2）
│   ├── nuxt-module/        # @ku-utils/nuxt-module
│   ├── custom-columns/
│   └── v2-custom-columns/
├── tools/                  # CLI 工具
│   ├── cli/                # @ku-utils/cli
│   └── create-app/         # @ku-utils/create-app
├── apps/
│   ├── playground-vue2/
│   ├── playground-vue3/
│   ├── playground-nuxt4/
│   └── kv3-admin/          # Vue 3 + Element Plus starter（不发布）
├── docs/                   # VitePress 文档站
├── scripts/                # 构建/发布脚本
└── skills/                 # AI Agent Skills
```

## 三、日常开发流程

### 3.1 构建

```bash
# 构建所有包
pnpm build

# 构建指定包
pnpm turbo build --filter=@ku-utils/utils

# 启动 watch 模式（开发时）
pnpm --filter @ku-utils/utils dev
```

### 3.2 验证

```bash
# 启动 Vue 3 playground 进行交互验证
pnpm --filter @ku-utils/playground-vue3 dev

# 启动 Nuxt 4 playground
pnpm --filter @ku-utils/playground-nuxt4 dev
```

### 3.3 代码质量检查

```bash
# 全量 lint
pnpm lint

# 自动修复
pnpm lint:fix

# 格式化
pnpm format

# 类型检查
pnpm typecheck
```

## 四、新增包

1. 在 `packages/` 下创建目录，例如 `packages/my-lib/`
2. 初始化 `package.json`，确保：
   - `name` 使用 `@ku-utils/my-lib` 格式
   - 添加 `"publishConfig": { "access": "public" }`
   - `version` 设为 `0.0.1`
3. 添加 `tsconfig.json`，继承 `@ku-utils/tsconfig/library.json`
4. 编写源码和构建脚本
5. 在 `commitlint.config.js` 中添加新的 scope

`package.json` 模板：

```json
{
  "name": "@ku-utils/my-lib",
  "version": "0.0.1",
  "publishConfig": {
    "access": "public"
  },
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "@ku-utils/tsconfig": "workspace:*",
    "tsup": "^8.5.0",
    "typescript": "^5.8.3"
  }
}
```

> **注意**：`exports` 中 `types` 条件必须放在 `import` 和 `require` 之前，否则 TypeScript 无法正确解析类型。

## 五、Commit 规范

项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范，由 commitlint + husky 自动校验。

### 格式

```
type(scope): 中文描述
```

> **约定**：`message` 部分尽量使用中文描述，commitlint 会在纯英文时给出警告提醒。`type` 和 `scope` 保持英文不变。

### type 允许值

| type       | 说明                       |
| ---------- | -------------------------- |
| `feat`     | 新功能                     |
| `fix`      | 修复 bug                   |
| `docs`     | 文档变更                   |
| `style`    | 代码格式（不影响逻辑）     |
| `refactor` | 重构（既非新功能亦非修复） |
| `perf`     | 性能优化                   |
| `test`     | 测试相关                   |
| `build`    | 构建/依赖变更              |
| `ci`       | CI/CD 配置                 |
| `chore`    | 其他杂项                   |
| `revert`   | 回退提交                   |
| `release`  | 版本发布                   |

### scope 允许值

```
eslint-config | prettier-config | tsconfig | stylelint-config
utils | hooks | directives | ui | ui-vue2
constants | i18n | types | nuxt-module
custom-columns | v2-custom-columns
cli | create-app | kv3-admin | docs | deps | ci | release
```

### 示例

```bash
git commit -m "feat(utils): 新增货币格式化函数"
git commit -m "fix(hooks): 修复 useCountdown 内存泄漏"
git commit -m "docs(ui): 更新 DuButton 使用示例"
git commit -m "chore(deps): 升级 typescript 到 5.8.3"
```

## 六、Pre-commit 钩子

提交时会自动触发以下检查（由 husky + lint-staged 执行）：

| 文件类型                            | 执行动作           |
| ----------------------------------- | ------------------ |
| `packages/**/*.{ts,tsx,js,jsx,vue}` | `eslint --fix`     |
| `tools/**/*.{ts,tsx,js,jsx,vue}`    | `eslint --fix`     |
| `*.{json,md,css,scss}`              | `prettier --write` |

如果检查不通过，提交将被阻止。请先修复问题再重新提交。

## 七、版本发布

本项目使用 [Changesets](https://github.com/changesets/changesets) 管理版本和变更日志。

### 7.1 创建变更记录

当你的改动需要发布新版本时：

```bash
pnpm changeset
```

按交互提示选择：

1. 受影响的包
2. 版本类型（patch / minor / major）
3. 变更描述

这会在 `.changeset/` 目录生成一个 markdown 文件，需要一起提交。

### 7.2 版本号规范

遵循 [语义化版本（SemVer）](https://semver.org/lang/zh-CN/)。

| 类型    | 场景               | 示例          |
| ------- | ------------------ | ------------- |
| `patch` | 修复 bug、文档更新 | 1.0.1 → 1.0.2 |
| `minor` | 新增功能、向后兼容 | 1.0.2 → 1.1.0 |
| `major` | 破坏性变更         | 1.1.2 → 2.0.0 |

### 7.3 执行发布

推荐走 GitHub Actions：合入带 changeset 的 PR 后，合并 bot 打开的 Version Packages PR 即可发布到 npm 并打 tag。详见 [发布到 npm](./npm-publish.md)。

本地紧急发版：

```bash
# 方式一：一键发布
bash scripts/publish.sh

# 方式二：分步执行
pnpm changeset version
pnpm turbo build --filter='./packages/*' --filter='./tools/*'
pnpm changeset publish
git push --follow-tags
```

> 发布前执行 `npm whoami`，确认对 `@ku-utils` scope 有权限。CI 使用仓库 Secrets 中的 `NPM_TOKEN`。

## 八、代码规范

### CSS / SCSS

禁止使用 `&` 拼接类名：

```scss
// 禁止
.card {
  &-header {
  }
  &__content {
  }
  &--active {
  }
}

// 正确
.card-header {
}
.card-content {
}
.card-active {
}
```

允许 `&` 用于状态类：

```scss
// 允许
.card {
  &.active {
  }
  &:hover {
  }
}
```

### TypeScript

- 使用 `type-imports` 导入类型：`import { type Foo } from './types'`
- 使用 `const` 声明，避免 `var` 和 `let`（除非确实需要重新赋值）
- 未使用变量以 `_` 开头
- 避免 `any`，必要时加 `// eslint-disable-next-line` 注释说明原因

### Vue 组件

- `<script setup lang="ts">` 放在 `<template>` 之前
- 使用 type-based 定义 `defineProps` / `defineEmits`
- 组件不强制多单词命名（已关闭 `vue/multi-word-component-names`）

## 九、常见问题

### `pnpm install` 报权限错误

确认 `@ku-utils` 未被 `.npmrc` 指到非 npmjs.org 的 registry。公开包一般不需要 `_auth`。发布请使用 `npm login` 或 CI 的 `NPM_TOKEN`。

### ESLint 无法解析 .vue 文件

确保安装了 `eslint-plugin-vue` 和 `typescript-eslint`：

```bash
pnpm add -D eslint-plugin-vue typescript-eslint @stylistic/eslint-plugin eslint-plugin-import-x globals
```

### 构建产物中没有类型声明文件

检查 `tsup.config.ts` 中是否配置了 `dts: true`。

### Changeset 提示 "No changed packages"

确保你修改的包的 `version` 字段不是 `0.0.0`（私有根包不参与发布）。
