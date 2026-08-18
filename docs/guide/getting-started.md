# 快速上手

## 前置条件

- Node.js >= 20
- pnpm >= 10

包已发布到 npm，直接安装即可。详见 [从 npm 安装](/guide/npm)。

## 本仓 starter

```bash
pnpm dev:admin
```

打开 `apps/kv3-admin`（Vue 3 + Element Plus），默认 Mock + Example，入口 `/example`。依赖为本仓 `workspace:*` 的 `@ku-utils/utils` / `hooks` / `custom-columns`。

## 方式一：创建新项目

```bash
npx @ku-utils/create-app my-project
# 或
npx @ku-utils/cli create my-project
```

## 方式二：已有项目接入

```bash
# 安装工程配置
pnpm add -D @ku-utils/eslint-config @ku-utils/prettier-config @ku-utils/tsconfig eslint

# 安装业务包（按需）
pnpm add @ku-utils/utils @ku-utils/hooks @ku-utils/ui
```

### 配置 ESLint

创建 `eslint.config.js`：

```javascript
// Vue 3 项目
import vue3Config from '@ku-utils/eslint-config/vue3';
export default [...vue3Config];

// Vue 2 项目
import vue2Config from '@ku-utils/eslint-config/vue2';
export default [...vue2Config];

// Nuxt 4 项目
import nuxt4Config from '@ku-utils/eslint-config/nuxt4';
export default [...nuxt4Config];
```

### 配置 Prettier

在 `package.json` 中添加：

```json
{
  "prettier": "@ku-utils/prettier-config"
}
```

### 配置 TypeScript

创建 `tsconfig.json`：

```json
{
  "extends": "@ku-utils/tsconfig/vue3.json"
}
```

### 配置 Nuxt 4 模块

```bash
pnpm add @ku-utils/nuxt-module @ku-utils/ui @ku-utils/hooks @ku-utils/directives @ku-utils/design-tokens
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@ku-utils/nuxt-module'],
});
```
