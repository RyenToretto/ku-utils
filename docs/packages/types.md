# Types 类型定义

`@ku-utils/types` 导出团队共用的 TypeScript 类型（仅类型，无运行时代码）。

## 安装

```bash
pnpm add -D @ku-utils/types
```

## 使用示例

```typescript
import type { ApiResponse, PaginatedResponse, SelectOption } from '@ku-utils/types';

async function fetchList(): Promise<PaginatedResponse<{ id: string }>> {
  // ...
  return { list: [], total: 0, page: 1, pageSize: 10 };
}
```

## 导出概要

### `api`

- `ApiResponse<T>`、`PaginatedResponse<T>`、`PaginationParams`、`SortParams`、`ApiError`

### `common`

- `Nullable`、`MaybeRef`、`Recordable`、`DeepPartial`、`ValueOf`、`PickRequired`、`Awaitable`、`Arrayable`
- `SelectOption`、`TreeNode`、`MenuItem`、`UserInfo`

### `component`

- `TableColumn`、`FormField`、`FormRule`、`BreadcrumbItem`、`TabItem`
