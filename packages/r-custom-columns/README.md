# @ku-utils/r-custom-columns

React + Ant Design 5 自定义列组件库，对应 Vue 3 包 `@ku-utils/custom-columns`。

基于 **schema** 驱动表格列显隐、排序与 localStorage 持久化（含 `schemaVersion`）。

## 安装

```bash
pnpm add @ku-utils/r-custom-columns
```

Peer：`react` / `react-dom` >= 18，`antd` >= 5.21（列 `minWidth`），`@ant-design/icons` >= 5。

```ts
import '@ku-utils/r-custom-columns/style.css';
```

## 快速上手

```tsx
import { Table } from 'antd';
import {
  useSchemaColumnConfig,
  SchemaColumnConfigContext,
  DoTableHeader,
  schemasToColumns,
  type ColumnSchema,
} from '@ku-utils/r-custom-columns';
import '@ku-utils/r-custom-columns/style.css';

const columnSchemas: ColumnSchema[] = [
  { prop: 'name', label: '名称', isDefault: true, fixed: true },
  { prop: 'amount', label: '金额', group: '财务', renderType: 'float', isDefault: true },
  { prop: 'rate', label: '转化率', group: '财务', renderType: 'percent' },
  { prop: 'createdAt', label: '创建时间', group: '其它' },
];

function OrderList() {
  const config = useSchemaColumnConfig({
    columnSchemas,
    storageKey: 'order_list_cols',
    schemaVersion: 1,
  });

  const columns = schemasToColumns(config.visibleSchemas, {
    formatCell: config.formatSchemaCell,
  });

  return (
    <SchemaColumnConfigContext.Provider value={config}>
      <DoTableHeader disabledColumnConfig={false} />
      <Table
        key={config.tableRenderKey}
        rowKey="id"
        columns={columns}
        dataSource={[]}
      />
    </SchemaColumnConfigContext.Provider>
  );
}
```

## API 摘要

### `useSchemaColumnConfig(options)`

返回值即 `SchemaColumnConfigContext` 的值：

| 返回值                                                                                                       | 说明                                   |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| `visibleSchemas`                                                                                             | 当前可见列（已过滤/排序）              |
| `tableColumns`                                                                                               | 抽屉用扁平元数据                       |
| `tableRenderKey`                                                                                             | 列变化时建议作为 Table `key`           |
| `formatSchemaCell`                                                                                           | `float` / `percent` / `integer` 格式化 |
| `readCacheConfig` / `getDefaultConfig` / `applyColumnConfig` / `saveConfigToLocal` / `removeConfigFromLocal` | 存储辅助                               |

### `schemasToColumns(schemas, { formatCell })`

将 `ColumnSchema[]` 转为 Ant Design `ColumnsType`。嵌套表头用 `children`；自定义单元格用 `cellRender`，透传用 `antdAttrs`。

- `minWidth` → 列 `minWidth`（不当固定宽）；需要 el-table 式按 minWidth 比例分余宽时由业务侧计算 `width`
- `fixed` 只表示「弹窗中不可取消勾选」，不决定列钉在左右；需要钉列用 `antdAttrs: { fixed: 'left' }`

### 组件

交互与 Vue 包 1:1：

- **DoTableHeader** — 左 `batch`、右 `control` +「自定义列」（`disabledColumnConfig` 默认 `true` 即隐藏）；悬停列出本地配置，选中即应用，「自定义配置」打开配置抽屉
- **DoConfigColumnDialog** — 1000px 抽屉：搜索、左侧分组导航（滚动联动）、中间分组勾选（全选/反选）、右侧已选列（固定区 + 拖拽排序）、存到本地 / 读取本地 / 取消 / 完成；`ref.showConfigColumnDialog(config?)` 打开
- **DoReadColumnConfig** — 本地配置列表（悬停非系统配置可删除）

## 与 Vue 包差异

| Vue (`custom-columns`)      | React (`r-custom-columns`)  |
| --------------------------- | --------------------------- |
| `cellComponent` / `elAttrs` | `cellRender` / `antdAttrs`  |
| `provide` + inject          | `SchemaColumnConfigContext` |
| Element Plus Drawer/Popover | Ant Design Drawer/Popover   |
| `vue-draggable-plus`        | `sortablejs`（同一引擎）    |

## 开发

```bash
pnpm --filter @ku-utils/r-custom-columns build
```
