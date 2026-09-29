# @ku-utils/hooks-react

> React Hooks 集合（与 `@ku-utils/hooks` 对应的 React 侧能力）。

## 安装

```bash
pnpm add @ku-utils/hooks-react
```

peer：`react` ^18 或 ^19。

## 可用 Hooks

`useMaxHeight` · `useVersionUpdate`

## 使用

```tsx
import { useMaxHeight, useVersionUpdate } from '@ku-utils/hooks-react';

const { maxHeight, refresh } = useMaxHeight({
  targetSelector: '.table-wrap .ant-table',
});

const { hasUpdate, checkVersion, refreshForUpdate } = useVersionUpdate({
  fetchVersion: () => fetch('/version.json').then((r) => r.json()),
});
```

## 安装源

发布于 npmjs.org，直接 `pnpm add` 即可。

---

详细文档请参考 [ku-utils 文档站](../../docs/)
