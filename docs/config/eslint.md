# ESLint 配置

`@ku-utils/eslint-config` 基于 ESLint v9 Flat Config，提供四种预设。

## 安装

```bash
pnpm add -D @ku-utils/eslint-config eslint
```

## 预设

| 预设                            | 适用场景      |
| ------------------------------- | ------------- |
| `@ku-utils/eslint-config/base`  | 纯 JS/TS 项目 |
| `@ku-utils/eslint-config/vue2`  | Vue 2 项目    |
| `@ku-utils/eslint-config/vue3`  | Vue 3 项目    |
| `@ku-utils/eslint-config/nuxt4` | Nuxt 4 项目   |

## 使用

```javascript
// eslint.config.js
import vue3Config from '@ku-utils/eslint-config/vue3';

export default [
  ...vue3Config,
  {
    rules: {
      // 项目级规则覆盖
    },
  },
];
```

## 内置规则

- **代码风格**: 分号、单引号、尾逗号、2 空格缩进
- **TypeScript**: 严格类型检查、一致的类型导入
- **Vue**: 组件标签顺序、宏定义顺序、type-based Props/Emits
- **Import**: 导入排序、禁止重复导入
