---
name: v2-custom-columns
description: Vue2 自定义列接入指南（@ku-utils/v2-custom-columns）。当需要为 Element UI 表格页面增加「自定义列」能力（schema + v-for 驱动、列配置持久化、拖拽排序、分组导航、嵌套表头），或从旧 tableControl 迁移时使用。
---

# Vue2 自定义列接入 Skill

`@ku-utils/v2-custom-columns` 是基于 Vue 2.7 + Element UI 的自定义列方案：核心是 `useSchemaColumnConfig` **mixin**（Options API），通过 `provide('crud', this)` 让 `DoTableHeader` / `DoConfigColumnDialog` / `DoReadColumnConfig` 读写列配置；schema 驱动 `v-for` 渲染（嵌套表头用 `SchemaColumn`），配置持久化到 localStorage。无 `messages` 选项（弹窗文案包内中文）；类型由包导出。

## Step 0：确认依赖

消费项目已安装 `@ku-utils/v2-custom-columns`（peer：`vue` 2.6+/2.7、`element-ui` >= 2.15、`vuedraggable` >= 2.24），并在入口引入样式：

```js
// main.js / main.ts
import '@ku-utils/v2-custom-columns/style';
```

## Step 1：定义列 schema

新建 `xxxColumnSchemas.ts`，导出 `ColumnSchema[]`：

```ts
import type { ColumnSchema } from '@ku-utils/v2-custom-columns';

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
- `renderHeader` / `headerTooltip`：自定义列头（`renderHeader` 为 Element UI `(h, { column, $index }) => VNode`）
- `elAttrs`：透传 `el-table-column` 原生属性
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
      schemaStorageKey: 'admin-users-columns',
      schemaVersion: 1,
      alwaysVisibleColumns: [{ prop: 'id', label: 'ID' }],
    };
  },
};
```

可在 `data()` 覆盖：`maxConfigCount`（默认 10）、`maxSelectCount`（默认 50）、`onDialogClose`。

## Step 3：模板组合

`DoTableHeader` 须放在混入 mixin 的组件内部（它 inject `crud`）；项目有 `TableWrap` 时用 `enable-do-header` 渲染，否则局部注册后放表格上方：

```vue
<do-table-header :disabled-column-config="false" />
<el-table :key="tableRenderKey" :data="tableData" border stripe>
  <el-table-column prop="id" label="ID" fixed="left" width="80" />
  <el-table-column
    v-for="schema in visibleSchemas"
    :key="schema.prop"
    :prop="schema.prop"
    :label="schema.label"
    :min-width="schema.minWidth || undefined"
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
```

嵌套表头改用内置递归组件（`components: { SchemaColumn }`）：

```vue
<schema-column
  v-for="schema in visibleSchemas"
  :key="schema.prop || schema.label"
  :schema="schema"
  :format-cell="formatSchemaCell"
/>
```

`cellComponent` 写在 `data()` 时用 `markRaw()` 包住，避免组件选项被深度响应化。

## API 速查

mixin 注入到组件实例：

| 成员                                                                                        | 说明                                |
| ------------------------------------------------------------------------------------------- | ----------------------------------- |
| `visibleSchemas`                                                                            | 当前应渲染的列 schema（模板 v-for） |
| `tableRenderKey`                                                                            | `el-table :key` 强制重建            |
| `formatSchemaCell(val, schema)`                                                             | 单元格格式化                        |
| `applyColumnConfig` / `saveConfigToLocal` / `updateConfigInLocal` / `removeConfigFromLocal` | 配置增删改                          |
| `readCacheConfig` / `getDefaultConfig`                                                      | 配置读取                            |

组件：`DoTableHeader`、`DoConfigColumnDialog`、`DoReadColumnConfig`、`SchemaColumn`；`Vue.use(default)` 全局注册以上组件。

存储 key：`${schemaStorageKey}_${路由 path}_${应用版本号}_sv${schemaVersion}`。

## FAQ

- **列顺序改了不生效**：检查 `el-table` 是否绑定 `:key="tableRenderKey"`
- **配置互相覆盖**：检查 `schemaStorageKey` 是否全局唯一
- **旧缓存导致新列不显示**：字段重命名/删除时递增 `schemaVersion`
- **自定义列按钮不显示**：`DoTableHeader` 需 `:disabled-column-config="false"`，且位于混入 mixin 的组件内部
- **从 tableControl 迁移**：两者不可同时混入；列改为 schema 驱动后移除 `tableControl`
