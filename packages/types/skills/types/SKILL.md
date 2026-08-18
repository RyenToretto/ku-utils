---
name: types
description: 使用 @ku-utils/types 中的共享 TypeScript 类型（Nullable、ApiResponse、SelectOption 等）。当需要定义 API 响应类型、通用工具类型、组件 Props 类型时使用。
---

# @ku-utils/types Skill

跨项目共享的 TypeScript 类型定义，纯类型包（`export type *`），零运行时开销。

## 安装

```bash
npm install @ku-utils/types
```

**始终使用 `import type`**：

```ts
import type { Nullable, ApiResponse } from '@ku-utils/types';
```

## 通用工具类型

```ts
import type {
  Nullable, // T | null
  MaybeRef, // T | Ref<T>（Vue 3）
  Recordable, // Record<string, T>
  DeepPartial, // 深度可选
  ValueOf, // 提取对象值类型
  PickRequired, // 将指定字段变为必填
  Awaitable, // T | Promise<T>
  Arrayable, // T | T[]
} from '@ku-utils/types';

// 示例
const val: Nullable<string> = null; // string | null
const val2: MaybeRef<number> = ref(1); // number | Ref<number>
const map: Recordable<User> = {}; // Record<string, User>
const patch: DeepPartial<Config> = { theme: {} }; // 嵌套可选
```

## API 类型

```ts
import type {
  ApiResponse, // 单条数据响应
  PaginatedResponse, // 分页列表响应
  PaginationParams, // 分页请求参数
  SortParams, // 排序参数
  ApiError, // 错误响应
} from '@ku-utils/types';

// 接口定义
async function getUser(id: string): Promise<ApiResponse<User>> {}
async function getList(params: PaginationParams): Promise<PaginatedResponse<Item>> {}

// 响应结构
interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
  success: boolean;
}

interface PaginatedResponse<T = unknown> {
  code: number;
  data: { list: T[]; total: number; page: number; pageSize: number };
  message: string;
  success: boolean;
}
```

## 组件/UI 类型

```ts
import type {
  SelectOption,   // 下拉选项 { label, value, disabled?, children? }
  TreeNode,       // 树节点 { id, label, children?, data? }
  MenuItem,       // 菜单项 { key, label, icon?, path?, children?, permission? }
  TableColumn,    // 表格列配置
  FormField,      // 表单字段配置
} from '@ku-utils/types'

// 常用示例
const options: SelectOption[] = [
  { label: '选项A', value: 1 },
  { label: '选项B', value: 2, disabled: true },
]

const menus: MenuItem[] = [
  { key: 'home', label: '首页', icon: 'home', path: '/home' },
  { key: 'admin', label: '管理', permission: 'admin', children: [...] },
]
```

## 用户信息类型

```ts
import type { UserInfo } from '@ku-utils/types';

interface UserInfo {
  id: string;
  username: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
}
```

## TypeScript 最佳实践

```ts
// 1. 使用 import type 减少运行时体积
import type { Nullable, SelectOption } from '@ku-utils/types'

// 2. DeepPartial 用于 PATCH 请求
type UpdateUserPayload = DeepPartial<UserInfo>

// 3. Recordable 替代 Record<string, unknown>
const cache: Recordable<User> = {}

// 4. Awaitable 使函数更通用
function process(input: Awaitable<string>) {
  return Promise.resolve(input).then(...)
}

// 5. PickRequired 让可选字段在特定场景变为必填
type RequiredForm = PickRequired<FormData, 'name' | 'email'>
```
