# @ku-utils/r-custom-columns

React + Ant Design 5 自定义列组件库，对应 Vue 3 包 `@ku-utils/custom-columns`。

基于 **schema** 驱动表格列显隐、排序与 localStorage 持久化（含 `schemaVersion`）。

## 安装

```bash
pnpm add @ku-utils/r-custom-columns
```

Peer：`react` / `react-dom` >= 18，`antd` >= 5.21（列 `minWidth`）。

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
  DoConfigColumnDialog,
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

  const columns = schemasToColumns(config.visibleColumns, {
    formatCell: config.formatSchemaCell,
  });

  return (
    <SchemaColumnConfigContext.Provider value={config}>
      <DoTableHeader />
      <Table
        key={config.tableRenderKey}
        rowKey="id"
        columns={columns}
        dataSource={[]}
      />
      <DoConfigColumnDialog />
    </SchemaColumnConfigContext.Provider>
  );
}
```

不使用 Context 时，也可命令式传 props：

```tsx
<DoTableHeader onOpen={config.openConfig} />
<DoConfigColumnDialog
  open={config.configVisible}
  onCancel={config.closeConfig}
  tableColumns={config.tableColumns}
  messages={config.messages}
  onSave={(cols) => {
    config.applyConfig(cols);
    config.closeConfig();
  }}
  onReset={config.resetConfig}
/>
```

## API 摘要

### `useSchemaColumnConfig(options)`

| 返回值                                                                                                       | 说明                                   |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| `schemas`                                                                                                    | 入参 schema                            |
| `visibleColumns` / `visibleSchemas`                                                                          | 当前可见列（已过滤/排序）              |
| `openConfig` / `closeConfig` / `configVisible`                                                               | 弹窗开关                               |
| `applyConfig(columns, label?)`                                                                               | 应用选中列到激活配置并写缓存           |
| `resetConfig()`                                                                                              | 重置为默认（`isDefault` 优先）         |
| `tableColumns`                                                                                               | 弹窗用扁平元数据                       |
| `tableRenderKey`                                                                                             | 列变化时建议作为 Table `key`           |
| `formatSchemaCell`                                                                                           | `float` / `percent` / `integer` 格式化 |
| `readCacheConfig` / `getDefaultConfig` / `applyColumnConfig` / `saveConfigToLocal` / `removeConfigFromLocal` | 存储辅助                               |

### `schemasToColumns(schemas, { formatCell })`

将 `ColumnSchema[]` 转为 Ant Design `ColumnsType`。嵌套表头用 `children`；自定义单元格用 `cellRender`，透传用 `antdAttrs`。

- `minWidth` → 列 `minWidth`（不当固定宽）；需要 el-table 式按 minWidth 比例分余宽时由业务侧计算 `width`
- `fixed` 只表示「弹窗中不可取消勾选」，不决定列钉在左右；需要钉列用 `antdAttrs: { fixed: 'left' }`

### 组件

- **DoTableHeader** — 「自定义列」按钮（可插 `batch` / `control`）
- **DoConfigColumnDialog** — 勾选 + 上移/下移排序的配置 Modal（MVP，非完整拖拽/多套命名配置 UI）

## 与 Vue 包差异

| Vue (`custom-columns`)      | React (`r-custom-columns`)  |
| --------------------------- | --------------------------- |
| `cellComponent` / `elAttrs` | `cellRender` / `antdAttrs`  |
| `provide` + inject          | `SchemaColumnConfigContext` |
| Element Plus + Drawer       | Ant Design Modal            |
| `vue-draggable-plus`        | 上移/下移按钮（MVP）        |

## 开发

```bash
pnpm --filter @ku-utils/r-custom-columns build
```
