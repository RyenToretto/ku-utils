# @ku-utils/nuxt-module

> Nuxt 4 集成模块，自动注册组件与 composables。

## 安装

```bash
pnpm add @ku-utils/nuxt-module
```

## 使用

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@ku-utils/nuxt-module'],
});
```

安装后以下内容自动可用，无需手动导入：

- **组件**：`DuButton`、`DuEmpty`、`DuModal`、`DuStatusTag`
- **Composables**：`useLoading`、`useRequest`、`usePagination`、`useClipboard`、`useCountdown`、`useEventBus`、`useMediaQuery`、`useBreakpoint`、`useFullscreen`、`useInterval`、`useWebSocket`
- **指令**：通过客户端插件自动注册
- **CSS**：自动引入 `@ku-utils/skin`（`--ku-*` 皮肤变量）+ UI 样式

## 安装源

发布于 npmjs.org，直接 `pnpm add` 即可。

---

详细文档请参考 [ku-utils 文档站](../../docs/)
