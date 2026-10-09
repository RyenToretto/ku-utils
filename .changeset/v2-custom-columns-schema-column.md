---
'@ku-utils/v2-custom-columns': major
---

与 Vue 3 包对齐：新增递归列组件 `SchemaColumn`（嵌套表头、`cellComponent`、`renderHeader` / `headerTooltip` 经 `#header` 插槽渲染、`elAttrs`），新增 `types/index.d.ts` 导出 `ColumnSchema` 等类型，`DoTableHeader` 补组件名以支持 `Vue.use` 全局注册；随包 rules / skills 按真实 API 重写。

**破坏性变更**：`formatSchemaCell` 改为包内按 `renderType`（`integer` / `float` / `percent`）格式化，与 `@ku-utils/custom-columns` 逐分支一致，不再读取消费方组件的同名 filter；移除 `roi-link` 渲染类型。迁移：删掉为列格式化注册的本地 filter；`percent` 入参为比率（0.126 → 12.6%），已是百分数的字段改用 `cellComponent` 自定义；原 `roi-link` 列改用 `float` 或 `cellComponent`。
