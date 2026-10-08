---
'@ku-utils/r-custom-columns': minor
---

配置 UI 与 Vue 包 1:1：`DoTableHeader` 悬停列出本地配置并内含配置抽屉（新增 `DoReadColumnConfig`）；`DoConfigColumnDialog` 改为 1000px 抽屉（搜索、分组导航、勾选、固定区 + sortablejs 拖拽、存到本地 / 读取本地），`ref.showConfigColumnDialog(config?)` 打开。

破坏性变更：

- `DoTableHeader` 的 `disabled` / `onOpen` / `label` 改为 `disabledColumnConfig`（默认 `true`）；页面不再单独渲染 `<DoConfigColumnDialog />`
- `useSchemaColumnConfig` 移除 `openConfig` / `closeConfig` / `configVisible` / `applyConfig` / `resetConfig` 与 `schemas` / `visibleColumns`，统一用 `visibleSchemas`
- `CustomColumnMessages` 移除 `moveUp` / `moveDown`
- 新增 peer `@ant-design/icons` >= 5；`style.css` 改用 `--ku-*` 实际存在的 token
