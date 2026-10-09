# @ku-utils/r-custom-columns

## 0.2.0

### Minor Changes

- 0a82c72: 配置 UI 与 Vue 包 1:1：`DoTableHeader` 悬停列出本地配置并内含配置抽屉（新增 `DoReadColumnConfig`）；`DoConfigColumnDialog` 改为 1000px 抽屉（搜索、分组导航、勾选、固定区 + sortablejs 拖拽、存到本地 / 读取本地），`ref.showConfigColumnDialog(config?)` 打开。

  破坏性变更：

  - `DoTableHeader` 的 `disabled` / `onOpen` / `label` 改为 `disabledColumnConfig`（默认 `true`）；页面不再单独渲染 `<DoConfigColumnDialog />`
  - `useSchemaColumnConfig` 移除 `openConfig` / `closeConfig` / `configVisible` / `applyConfig` / `resetConfig` 与 `schemas` / `visibleColumns`，统一用 `visibleSchemas`
  - `CustomColumnMessages` 移除 `moveUp` / `moveDown`
  - 新增 peer `@ant-design/icons` >= 5；`style.css` 改用 `--ku-*` 实际存在的 token

- c97ecfd: `schema.fixed` 与 Vue 包同义，只表示「弹窗中不可取消勾选」，`schemaToColumn` 不再据此把列钉到左侧；需要钉列请用 `antdAttrs: { fixed: 'left' }`
- 331102a: `schemaToColumn` 把 schema `minWidth` 映射为 antd 列 `minWidth`（不再当作固定 `width`），余宽可按需分配；移除废弃别名 `SchemaColumn`、`schemasToAntdColumns`，统一用 `schemasToColumns`；peer `antd` 提至 `>=5.21.0`（列 `minWidth` 起始版本）

### Patch Changes

- @ku-utils/utils@1.5.4
