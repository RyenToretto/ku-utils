---
name: custom-columns
description: Vue3 自定义列接入指南（@ku-utils/custom-columns）。当需要为 Element Plus 表格页面增加「自定义列」能力（schema + v-for 驱动、列配置持久化、拖拽排序、分组导航、嵌套表头）时使用。
---

# Vue3 自定义列接入 Skill

`@ku-utils/custom-columns` 是基于 Vue3 + Element Plus 的自定义列方案，核心是 `useSchemaColumnConfig` composable + `DoTableHeader` / `DoConfigColumnDialog` / `DoReadColumnConfig` / `SchemaColumn` 组件，通过 `provide/inject` 协作，schema 驱动 `v-for` 渲染，配置持久化到 localStorage。

## Step 0：确认依赖

消费项目已安装 `@ku-utils/custom-columns`，并在入口引入样式：

```ts
// main.ts
import '@ku-utils/custom-columns/style';
```

`DoTableHeader` 通常由项目的 `TableWrap` 容器在 `enable-do-header` 时渲染，无需全局注册。

## Step 1：定义列 schema

新建 `xxxColumnSchemas.ts`，导出 `ColumnSchema[]`：

```ts
import type { ColumnSchema } from '@ku-utils/custom-columns';

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
- `cellComponent`：自定义单元格组件（props: row/column/index/schema）
- `renderHeader` / `headerTooltip`：自定义列头
- `isDefault`：无缓存时默认显示
- `children`：嵌套表头子列
- `fixed`：固定列（弹窗中不可取消勾选）

## Step 2：页面 setup 调用 composable

```ts
import { useSchemaColumnConfig } from '@ku-utils/custom-columns';

const { visibleSchemas, tableRenderKey, formatSchemaCell } = useSchemaColumnConfig({
  columnSchemas: USER_COLUMN_SCHEMAS,
  storageKey: 'admin_users_col',
  schemaVersion: 1,
});
```

## Step 3：模板组合

```vue
<TableWrap enable-do-header :disabled-column-config="false">
  <el-table :key="tableRenderKey" :data="list" border>
    <el-table-column prop="id" label="ID" fixed="left" width="80" />
    <el-table-column
      v-for="schema in visibleSchemas"
      :key="schema.prop"
      :prop="schema.prop"
      :label="schema.label"
      :min-width="schema.minWidth"
      :align="schema.align || 'left'"
      v-bind="schema.elAttrs || {}"
    >
      <template #default="{ row, column, $index }">
        <component :is="schema.cellComponent" v-if="schema.cellComponent"
          :row="row" :column="column" :index="$index" :schema="schema" />
        <span v-else>{{ formatSchemaCell(row[column.property], schema) }}</span>
      </template>
    </el-table-column>
  </el-table>
</TableWrap>
```

嵌套表头改用内置递归组件：

```vue
<SchemaColumn
  v-for="schema in visibleSchemas"
  :key="schema.prop || schema.label"
  :schema="schema"
  :format-cell="formatSchemaCell"
/>
```

## API 速查

`useSchemaColumnConfig(options)` 返回：

| 返回值                                                              | 说明                                |
| ------------------------------------------------------------------- | ----------------------------------- |
| `visibleSchemas`                                                    | 当前应渲染的列 schema（模板 v-for） |
| `tableRenderKey`                                                    | el-table :key 强制重建              |
| `formatSchemaCell(val, schema)`                                     | 单元格格式化                        |
| `applyColumnConfig` / `saveConfigToLocal` / `removeConfigFromLocal` | 配置增删改                          |
| `readCacheConfig` / `getDefaultConfig`                              | 配置读取                            |

options：`{ columnSchemas, storageKey?, schemaVersion?, alwaysVisibleColumns?, maxConfigCount?, maxSelectCount?, onDialogClose?, onLabelChange? }`

## FAQ

- **列顺序改了不生效**：检查 `el-table` 是否绑定 `:key="tableRenderKey"`
- **配置互相覆盖**：检查 `storageKey` 是否全局唯一
- **旧缓存导致新列不显示**：字段重命名/删除时递增 `schemaVersion`
- **自定义列按钮不显示**：`TableWrap` 需 `enable-do-header` + `:disabled-column-config="false"`
