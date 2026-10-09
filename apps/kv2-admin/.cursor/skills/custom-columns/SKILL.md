---
name: custom-columns
description: Vue2 自定义列接入指南（@ku-utils/v2-custom-columns）。当需要为 Element UI 表格页面增加「自定义列」能力（schema + v-for 驱动、列配置持久化、拖拽排序、分组导航、嵌套表头）时使用。
---

# Vue2 自定义列接入 Skill

`@ku-utils/v2-custom-columns` 是基于 Vue 2.7 + Element UI 的自定义列方案：核心是 `useSchemaColumnConfig` **mixin**（Options API），通过 `provide('crud', this)` 让 `DoTableHeader` / `DoConfigColumnDialog` / `DoReadColumnConfig` 读写列配置；schema 驱动 `v-for` 渲染，配置持久化到 localStorage。包为纯 JS，不导出 TS 类型，无 `messages` 选项（弹窗文案包内中文）。

## Step 0：确认依赖

消费项目已安装 `@ku-utils/v2-custom-columns`，并在入口引入样式：

```ts
// main.ts
import '@ku-utils/v2-custom-columns/style';
```

`DoTableHeader` 由项目的 `TableWrap` 在 `enable-do-header` 时渲染，页面无需注册。

## Step 1：定义列 schema

在模块 `_utils/xxxColumnSchemas.ts` 导出 schema 数组（`ColumnSchema` 类型在仓内声明）：

```ts
import type { ColumnSchema } from '@/modules/<域>/<子业务>/_utils/columnSchema';

export const USER_COLUMN_SCHEMAS: ColumnSchema[] = [
  { prop: 'nickname', label: '昵称', group: '基础信息', minWidth: 120 },
  {
    prop: 'balance',
    label: '余额',
    group: '账务',
    align: 'right',
    renderType: 'float',
    renderArgs: [2, true],
  },
  {
    prop: 'requestCount',
    label: '请求数',
    group: '统计',
    align: 'right',
    renderType: 'integer',
    isDefault: true,
  },
];
```

字段说明：

- `prop`：叶子列必填，全局唯一稳定（配置存储 key）
- `label`：列头文字
- `group`：弹窗左侧分组（默认「未分组」）
- `renderType` / `renderArgs`：内置格式化（text / integer / float / percent）
- `isDefault`：无缓存时默认显示
- `children`：嵌套表头子列
- `fixed`：固定列（弹窗中不可取消勾选）

## Step 2：组件混入 mixin

```js
import { useSchemaColumnConfig } from '@ku-utils/v2-custom-columns';

export default {
  name: 'UserList',
  mixins: [useSchemaColumnConfig],
  data() {
    return {
      columnSchemas: USER_COLUMN_SCHEMAS,
      schemaStorageKey: 'kv2-admin-users',
      schemaVersion: 1,
      alwaysVisibleColumns: [{ prop: 'id', label: 'ID' }],
    };
  },
};
```

可在 `data()` 覆盖：`maxConfigCount`（默认 10）、`maxSelectCount`（默认 50）、`onDialogClose`。

## Step 3：模板组合

```vue
<TableWrap enable-do-header :disabled-column-config="false">
  <el-table :key="tableRenderKey" :data="tableData" border stripe>
    <el-table-column prop="id" label="ID" fixed="left" width="80" />
    <el-table-column
      v-for="schema in visibleSchemas"
      :key="schema.prop || schema.label"
      :prop="schema.prop"
      :label="schema.label"
      :min-width="schema.minWidth || undefined"
      :align="schema.align || 'left'"
    >
      <template #default="{ row }">
        {{ formatSchemaCell(row[schema.prop], schema) }}
      </template>
    </el-table-column>
  </el-table>
</TableWrap>
```

嵌套表头：`visibleSchemas` 返回裁剪后的树，用局部递归列组件渲染 `children`（包不提供递归组件）。

## API 速查

mixin 注入到组件实例：

| 成员                                                                                        | 说明                                |
| ------------------------------------------------------------------------------------------- | ----------------------------------- |
| `visibleSchemas`                                                                            | 当前应渲染的列 schema（模板 v-for） |
| `tableRenderKey`                                                                            | `el-table :key` 强制重建            |
| `formatSchemaCell(val, schema)`                                                             | 单元格格式化                        |
| `applyColumnConfig` / `saveConfigToLocal` / `updateConfigInLocal` / `removeConfigFromLocal` | 配置增删改                          |
| `readCacheConfig` / `getDefaultConfig`                                                      | 配置读取                            |

存储 key：`${schemaStorageKey}_${路由 path}_${版本号}_sv${schemaVersion}`。

## FAQ

- **列顺序改了不生效**：检查 `el-table` 是否绑定 `:key="tableRenderKey"`
- **配置互相覆盖**：检查 `schemaStorageKey` 是否全局唯一
- **旧缓存导致新列不显示**：字段重命名/删除时递增 `schemaVersion`
- **自定义列按钮不显示**：`TableWrap` 需 `enable-do-header` + `:disabled-column-config="false"`
