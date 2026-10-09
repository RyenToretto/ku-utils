---
name: custom-columns
description: React 自定义列接入指南（@ku-utils/r-custom-columns）。当需要为 Ant Design 表格页面增加「自定义列」能力（schema 驱动列、列配置持久化、配置抽屉拖拽排序、分组导航、嵌套表头）时使用。
---

# React 自定义列接入 Skill

`@ku-utils/r-custom-columns` 是 React + Ant Design 5 的自定义列方案，与 Vue 3 包 `@ku-utils/custom-columns` 交互 1:1：`useSchemaColumnConfig` hook + `SchemaColumnConfigContext` 下发，`DoTableHeader`（悬停列出本地配置、内含配置抽屉）读取 Context，`schemasToColumns` 把 schema 转为 antd `columns`，配置持久化到 localStorage。

## Step 0：确认依赖

消费项目已安装 `@ku-utils/r-custom-columns`（peer：`react`/`react-dom` >= 18、`antd` >= 5.21、`@ant-design/icons` >= 5），入口引入样式：

```ts
// main.tsx
import '@ku-utils/r-custom-columns/style.css';
```

`DoTableHeader` 由项目 `TableWrap` 在 `enableDoHeader` 时渲染；页面无需再挂配置弹层。

## Step 1：定义列 schema

新建 `xxxColumnSchemas.ts`，导出 `ColumnSchema[]`：

```ts
import type { ColumnSchema } from '@ku-utils/r-custom-columns';

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
  { prop: 'requestCount', label: '请求数', group: '统计', renderType: 'integer', isDefault: true },
];
```

字段说明：

- `prop`：叶子列必填，全局唯一稳定（配置存储 key）
- `label`：列头文字；`group`：抽屉左侧分组（默认「未分组」）
- `renderType` / `renderArgs`：内置格式化（text / integer / float / percent）
- `cellRender({ value, record, index, schema })`：自定义单元格；`antdAttrs`：透传 antd 列属性
- `renderHeader` / `headerTooltip`：自定义列头
- `isDefault`：无缓存时默认显示；`children`：嵌套表头子列
- `fixed`：抽屉中不可取消勾选（不决定钉列；钉列用 `antdAttrs: { fixed: 'left' }`）

## Step 2：页面调用 hook

```tsx
import {
  SchemaColumnConfigContext,
  schemasToColumns,
  useSchemaColumnConfig,
} from '@ku-utils/r-custom-columns';

const config = useSchemaColumnConfig({
  columnSchemas: USER_COLUMN_SCHEMAS,
  storageKey: 'admin_users_col',
  schemaVersion: 1,
  messages: CUSTOM_COLUMN_MESSAGES, // 中文文案，覆盖 DEFAULT_CUSTOM_COLUMN_MESSAGES
});
```

## Step 3：下发 Context 并组合表格

```tsx
const columns = [
  { title: 'ID', dataIndex: 'id', width: 80, fixed: 'left' },
  ...schemasToColumns(config.visibleSchemas, { formatCell: config.formatSchemaCell }),
];

return (
  <SchemaColumnConfigContext.Provider value={config}>
    <TableWrap
      enableDoHeader
      disabledColumnConfig={false}
    >
      <Table
        key={config.tableRenderKey}
        rowKey="id"
        columns={columns}
        dataSource={list}
      />
    </TableWrap>
  </SchemaColumnConfigContext.Provider>
);
```

## API 速查

`useSchemaColumnConfig(options)` 返回（即 Context 值）：

| 返回值                                                              | 说明                                 |
| ------------------------------------------------------------------- | ------------------------------------ |
| `visibleSchemas`                                                    | 当前应渲染的列 schema（已过滤/排序） |
| `tableRenderKey`                                                    | Table `key`，列变化时强制重建        |
| `formatSchemaCell(val, schema)`                                     | 单元格格式化                         |
| `applyColumnConfig` / `saveConfigToLocal` / `removeConfigFromLocal` | 配置增删改                           |
| `readCacheConfig` / `getDefaultConfig`                              | 配置读取                             |

options：`{ columnSchemas, storageKey?, schemaVersion?, alwaysVisibleColumns?, maxConfigCount?, maxSelectCount?, messages?, onDialogClose?, onLabelChange? }`

## FAQ

- **列顺序改了不生效**：检查 Table 是否绑定 `key={config.tableRenderKey}`
- **配置互相覆盖**：检查 `storageKey` 是否全局唯一
- **旧缓存导致新列不显示**：字段重命名/删除时递增 `schemaVersion`
- **自定义列按钮不显示**：`TableWrap` 需 `enableDoHeader` + `disabledColumnConfig={false}`，且在 `SchemaColumnConfigContext.Provider` 内
