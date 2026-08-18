# @ku-utils/eslint-config

> ESLint Flat Config (v9) 共享配置，支持 Vue 2 / Vue 3 / Nuxt 4。

## 安装

```bash
pnpm add -D @ku-utils/eslint-config eslint
```

## 可用配置

| 导出路径                        | 说明        |
| ------------------------------- | ----------- |
| `@ku-utils/eslint-config/base`  | 基础规则    |
| `@ku-utils/eslint-config/vue2`  | Vue 2 项目  |
| `@ku-utils/eslint-config/vue3`  | Vue 3 项目  |
| `@ku-utils/eslint-config/nuxt4` | Nuxt 4 项目 |

## 使用

```js
// eslint.config.js
import vue3Config from '@ku-utils/eslint-config/vue3';

export default [...vue3Config];
```

## 安装源

发布于 npmjs.org，直接 `pnpm add` 即可。

---

详细文档请参考 [ku-utils 文档站](../../docs/)
