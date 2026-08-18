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
- **CSS**：自动引入 design-tokens 和 UI 样式

## 安装源

发布于 npmjs.org，直接 `pnpm add` 即可。

## AI Skill

安装后自动同步至 `.cursor/skills/nuxt-module/SKILL.md`，在 Cursor 对话中可按需调用：

> 在 Nuxt 4 项目中集成 @ku-utils/nuxt-module，一键启用 hooks auto-import、组件注册、指令、CSS tokens。

---

详细文档请参考 [ku-utils 文档站](../../docs/)
