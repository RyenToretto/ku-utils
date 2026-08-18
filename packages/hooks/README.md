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

---

详细文档请参考 [ku-utils 文档站](../../docs/)
