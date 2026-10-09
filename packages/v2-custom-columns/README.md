# @ku-utils/v2-custom-columns

Vue 2 + Element UI 自定义列组件库，对应 Vue 3 包 `@ku-utils/custom-columns`、React 包 `@ku-utils/r-custom-columns`、Angular 包 `@ku-utils/a-custom-columns`（四包交互 1:1）。

基于 **schema + v-for** 驱动表格列显隐、排序、分组导航、嵌套表头与 localStorage 多套配置持久化（含 `schemaVersion`）。核心是 Options API **mixin**（无 composable）。

## 安装

```bash
pnpm add @ku-utils/v2-custom-columns
```

Peer：`vue` 2.6+（`markRaw` 等写法需 2.7）、`element-ui` >= 2.15、`vuedraggable` >= 2.24。

```js
import '@ku-utils/v2-custom-columns/style';
```

安装时 `postinstall` 会把包内 `rules/`、`skills/` 复制到业务项目 `.cursor/`（已存在不覆盖；CI 跳过）。

## 快速上手

```vue
<template>
  <div>
    <DoTableHeader :disabled-column-config="false" />
    <el-table
      :key="tableRenderKey"
      :data="list"
      border
    >
      <el-table-column
        prop="id"
        label="ID"
        fixed="left"
        width="80"
      />
      <SchemaColumn
        v-for="schema in visibleSchemas"
        :key="schema.prop || schema.label"
        :schema="schema"
        :format-cell="formatSchemaCell"
      />
    </el-table>
  </div>
</template>

<script>
import { DoTableHeader, SchemaColumn, useSchemaColumnConfig } from '@ku-utils/v2-custom-columns';

/** @type {import('@ku-utils/v2-custom-columns').ColumnSchema[]} */
const ORDER_COLUMN_SCHEMAS = [
  { prop: 'name', label: '名称', isDefault: true },
  {
    prop: 'amount',
    label: '金额',
    group: '财务',
    align: 'right',
    renderType: 'float',
    isDefault: true,
  },
  { prop: 'rate', label: '转化率', group: '财务', align: 'right', renderType: 'percent' },
];

export default {
  components: { DoTableHeader, SchemaColumn },
  mixins: [useSchemaColumnConfig],
  data() {
    return {
      list: [],
      columnSchemas: ORDER_COLUMN_SCHEMAS,
      schemaStorageKey: 'order_list_cols',
      schemaVersion: 1,
      alwaysVisibleColumns: [{ prop: 'id', label: 'ID' }],
    };
  },
};
</script>
```

`DoTableHeader` 通过 `inject('crud')` 读取 mixin 状态，必须渲染在混入 mixin 的组件内部。扁平列也可直接 `v-for` 写 `el-table-column`，单元格用 `formatSchemaCell(row[column.property], schema)`。

## API 摘要

### `useSchemaColumnConfig`（mixin）

在 `data()` 中声明：`columnSchemas`（必填）、`schemaStorageKey`、`schemaVersion`（从 1 开始）、`alwaysVisibleColumns`、`maxConfigCount`（默认 10）、`maxSelectCount`（默认 50）、`onDialogClose`。

| 实例成员                                                                                                                             | 说明                                    |
| ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| `visibleSchemas`                                                                                                                     | 当前可见列（已过滤 / 排序，嵌套已裁剪） |
| `tableColumns`                                                                                                                       | 配置弹窗用扁平元数据                    |
| `tableRenderKey`                                                                                                                     | 列变化时作为 `el-table` 的 `key`        |
| `formatSchemaCell`                                                                                                                   | `float` / `percent` / `integer` 格式化  |
| `readCacheConfig` / `getDefaultConfig` / `applyColumnConfig` / `saveConfigToLocal` / `updateConfigInLocal` / `removeConfigFromLocal` | 存储辅助                                |

存储 key：`${schemaStorageKey}_${路由 path}_${应用版本号}_sv${schemaVersion}`；字段重命名 / 删除时递增 `schemaVersion`，旧缓存自然失效。

### 组件

- `DoTableHeader`：表头操作区（悬停列配置、读取配置），内含 `DoConfigColumnDialog` / `DoReadColumnConfig`
- `SchemaColumn`：递归渲染 schema（含 `children` 嵌套表头、`cellComponent`、`renderHeader` / `headerTooltip`、`elAttrs`）

`Vue.use(KuV2CustomColumns)`（默认导出插件）可全局注册以上组件。

### 类型

包内 `types/index.d.ts` 导出 `ColumnSchema`、`ColumnRenderType`、`ColumnConfig`、`TableStorage`、`AlwaysVisibleColumn`、`SchemaColumnConfigData`。

### 旧页面迁移

`ElementTableColumnAdapter` 仅用于旧 `tableControl` 页面过渡，新页面禁用。
