# @ku-utils/custom-columns

Vue 3 + Element Plus 自定义列组件库，对应 Vue 2 包 `@ku-utils/v2-custom-columns`、React 包 `@ku-utils/r-custom-columns`、Angular 包 `@ku-utils/a-custom-columns`（四包交互 1:1）。

基于 **schema + v-for** 驱动表格列显隐、排序、分组导航、嵌套表头与 localStorage 多套配置持久化（含 `schemaVersion`）。

## 安装

```bash
pnpm add @ku-utils/custom-columns
```

Peer：`vue` ^3.4、`element-plus` >= 2.3、`@element-plus/icons-vue` >= 2。

```ts
import '@ku-utils/custom-columns/style';
```

安装时 `postinstall` 会把包内 `rules/`、`skills/` 复制到业务项目 `.cursor/`（已存在不覆盖；CI 跳过）。

## 快速上手

```vue
<template>
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
</template>

<script setup lang="ts">
import {
  DoTableHeader,
  SchemaColumn,
  useSchemaColumnConfig,
  type ColumnSchema,
} from '@ku-utils/custom-columns';

const columnSchemas: ColumnSchema[] = [
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

const { visibleSchemas, tableRenderKey, formatSchemaCell } = useSchemaColumnConfig({
  columnSchemas,
  storageKey: 'order_list_cols',
  schemaVersion: 1,
});
</script>
```

## API 摘要

### `useSchemaColumnConfig(options)`

options：`columnSchemas`（必填）、`storageKey`、`schemaVersion`、`alwaysVisibleColumns`、`maxConfigCount`、`maxSelectCount`、`defaultConfigLabel`、`noNameLabel`、`messages`、`onDialogClose`、`onLabelChange`。

| 返回值                                                                                                       | 说明                                   |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| `visibleSchemas`                                                                                             | 当前可见列（已过滤 / 排序）            |
| `tableColumns`                                                                                               | 配置弹窗用扁平元数据                   |
| `tableRenderKey`                                                                                             | 列变化时作为 `el-table` 的 `key`       |
| `formatSchemaCell`                                                                                           | `float` / `percent` / `integer` 格式化 |
| `readCacheConfig` / `getDefaultConfig` / `applyColumnConfig` / `saveConfigToLocal` / `removeConfigFromLocal` | 存储辅助                               |

存储 key：`${storageKey}_${pathname}_sv${schemaVersion}`；字段重命名 / 删除时递增 `schemaVersion`，旧缓存自然失效。

### 组件

- `DoTableHeader`：表头操作区（悬停列配置、读取配置），内含 `DoConfigColumnDialog` / `DoReadColumnConfig`
- `SchemaColumn`：递归渲染 schema（含 `children` 嵌套表头）

`install(app)` 全局注册以上组件（命名导出，无 default export）。
