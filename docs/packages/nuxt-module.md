# Nuxt Module 集成

`@ku-utils/nuxt-module` 在 Nuxt 应用中自动接入设计令牌样式、`@ku-utils/ui` 组件样式、按需组件注册、Hooks 自动导入与指令插件。

## 安装

```bash
pnpm add @ku-utils/nuxt-module @ku-utils/ui @ku-utils/hooks @ku-utils/directives @ku-utils/design-tokens
```

## 使用示例

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@ku-utils/nuxt-module'],
});
```

## 模块选项 `kuUtils`

通过 `kuUtils` 键配置（均有默认值）：

| 选项          | 类型      | 默认   | 说明                                                       |
| ------------- | --------- | ------ | ---------------------------------------------------------- |
| `components`  | `boolean` | `true` | 注册 `DuButton`、`DuEmpty`、`DuModal`、`DuStatusTag`       |
| `composables` | `boolean` | `true` | 从 `@ku-utils/hooks` 自动导入列出的 composables            |
| `directives`  | `boolean` | `true` | 客户端插件中 `installDirectives`                           |
| `css`         | `boolean` | `true` | 注入 `@ku-utils/design-tokens/css` 与 `@ku-utils/ui/style` |

示例：

```typescript
export default defineNuxtConfig({
  modules: ['@ku-utils/nuxt-module'],
  kuUtils: {
    directives: true,
    css: true,
  },
});
```
