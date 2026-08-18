# 存量项目迁移指南

## 迁移步骤

### 1. 安装工程配置包

直接从 npm 安装：

```bash
pnpm add -D @ku-utils/eslint-config @ku-utils/prettier-config @ku-utils/tsconfig
```

### 2. 替换 ESLint 配置

删除旧的 `.eslintrc.js` / `.eslintrc.json`，创建 `eslint.config.js`：

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

### 3. 替换 Prettier 配置

删除旧的 `.prettierrc`，在 `package.json` 中添加：

```json
{ "prettier": "@ku-utils/prettier-config" }
```

### 4. 替换 TSConfig

更新 `tsconfig.json`：

```jsonc
// Vue 3
{ "extends": "@ku-utils/tsconfig/vue3.json" }

// Vue 2
{ "extends": "@ku-utils/tsconfig/vue2.json" }

// Nuxt 4（需先执行 nuxt prepare）
{ "extends": "./.nuxt/tsconfig.json" }
```

### 5. 逐步替换工具函数

将项目中的自定义工具函数替换为 `@ku-utils/utils`：

```typescript
// 旧
import { debounce } from '@/utils/debounce';
import { formatDate } from '@/utils/date';

// 新
import { debounce, formatDate } from '@ku-utils/utils';
```

### 6. 替换 HTTP 请求

```typescript
// 旧
import axios from 'axios';
const instance = axios.create({ ... });

// 新
import { createRequest } from '@ku-utils/request';
const http = createRequest({
  baseURL: '/api',
  interceptors: {
    requestInterceptor(config) {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
  },
});
```

### 7. 使用健康检查

```bash
npx @ku-utils/cli doctor
```

## 迁移清单

- [ ] 安装 `@ku-utils/eslint-config` 并替换旧 ESLint 配置
- [ ] 安装 `@ku-utils/prettier-config` 并替换旧 Prettier 配置
- [ ] 安装 `@ku-utils/tsconfig` 并替换旧 tsconfig
- [ ] 替换自定义工具函数为 `@ku-utils/utils`
- [ ] 替换自定义 hooks 为 `@ku-utils/hooks`
- [ ] 替换 axios 实例为 `@ku-utils/request`
- [ ] 安装 `@ku-utils/ui` 并替换可复用的业务组件
- [ ] 运行 `npx @ku-utils/cli doctor` 检查配置健康度
- [ ] 运行 `pnpm lint` 确保无报错

## 常见问题

### ESLint 报错 "flat config not supported"

确保 ESLint 版本 >= 9.0.0：

```bash
pnpm add -D eslint@^9.27.0
```

### 找不到 @ku-utils/\* 包

确认已从 npm 安装，且 `.npmrc` 没有把 `@ku-utils` 指到非 npmjs.org 的 registry。

### Vue 2 项目类型错误

确保使用 `@ku-utils/tsconfig/vue2.json` 而非 `vue3.json`。

### CSS 类名拼接报错

团队规范禁止使用 `&-suffix`、`&__item`、`&--modifier` 等 SCSS 嵌套拼接类名。请改写为完整类名：

```scss
// 错误
.card {
  &-header {
  }
  &__content {
  }
}

// 正确
.card-header {
}
.card-content {
}
```
