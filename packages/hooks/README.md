# @ku-utils/hooks

> Vue 3 Composables 集合。

## 安装

```bash
pnpm add @ku-utils/hooks
```

## 可用 Hooks

`useLoading` · `useRequest` · `usePagination` · `useClipboard` · `useCountdown` · `useEventBus` · `useMediaQuery` · `useBreakpoint` · `useFullscreen` · `useInterval` · `useWebSocket` · `useStorage`

## 使用

```ts
import { useRequest, useLoading } from '@ku-utils/hooks';

const { data, loading } = useRequest(() => fetchList());
```

## 安装源

发布于 npmjs.org，直接 `pnpm add` 即可。

## AI Skill

安装后自动同步至 `.cursor/skills/hooks/SKILL.md`，在 Cursor 对话中可按需调用：

> 使用 @ku-utils/hooks 中的 Vue 3 Composables（useRequest、usePagination、useClipboard 等）。当需要处理异步请求、分页、剪贴板、定时器等场景时使用。

---

详细文档请参考 [ku-utils 文档站](../../docs/)
