---
name: eslint-config
description: 为项目配置 @ku-utils/eslint-config ESLint 预设（base/vue2/vue3/nuxt4）。当初始化新项目 ESLint 或排查 lint 报错时使用。
---

# @ku-utils/eslint-config Skill

团队 ESLint Flat Config (v9) 预设，按项目类型选择对应配置。

## 安装

```bash
npm install -D @ku-utils/eslint-config eslint
```

## Vue 3 / Vite 项目

```js
// eslint.config.js
import vue3Config from '@ku-utils/eslint-config/vue3';

export default [
  ...vue3Config,
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.nuxt/**'],
  },
];
```

## Vue 2 项目

```js
// eslint.config.js
import vue2Config from '@ku-utils/eslint-config/vue2';

export default [
  ...vue2Config,
  {
    ignores: ['**/dist/**', '**/node_modules/**'],
  },
];
```

## Nuxt 4 项目

```js
// eslint.config.js
import nuxt4Config from '@ku-utils/eslint-config/nuxt4';

export default [
  ...nuxt4Config,
  {
    ignores: ['**/dist/**', '**/.nuxt/**', '**/.output/**'],
  },
];
```

## 纯 TS/JS 项目（无框架）

```js
// eslint.config.js
import baseConfig from '@ku-utils/eslint-config/base';

export default [
  ...baseConfig,
  {
    ignores: ['**/dist/**'],
  },
];
```

## 覆盖特定规则

```js
import vue3Config from '@ku-utils/eslint-config/vue3';

export default [
  ...vue3Config,
  {
    files: ['**/*.vue'],
    rules: {
      // 关闭特定规则
      'vue/block-lang': 'off',
      // 降级为 warning
      'vue/multi-word-component-names': 'warn',
    },
  },
  {
    // 针对特定目录关闭规则
    files: ['src/legacy/**/*.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
];
```

## package.json scripts 配置

```json
{
  "scripts": {
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix"
  }
}
```
