# @ku-utils/types

> 公共 TypeScript 类型定义。

## 安装

```bash
pnpm add -D @ku-utils/types
```

## 使用

```ts
import type { ApiResponse, PaginationParams } from '@ku-utils/types';

async function fetchList(params: PaginationParams): Promise<ApiResponse<Item[]>> {
  // ...
}
```

## 安装源

发布于 npmjs.org，直接 `pnpm add` 即可。

## AI Skill

安装后自动同步至 `.cursor/skills/types/SKILL.md`，在 Cursor 对话中可按需调用：

> 使用 @ku-utils/types 中的共享 TypeScript 类型（Nullable、ApiResponse、SelectOption 等）。当需要定义 API 响应类型、通用工具类型、组件 Props 类型时使用。

---

详细文档请参考 [ku-utils 文档站](../../docs/)
