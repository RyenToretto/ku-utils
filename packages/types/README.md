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

---

详细文档请参考 [ku-utils 文档站](../../docs/)
