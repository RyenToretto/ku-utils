---
'@ku-utils/custom-columns': patch
---

`SchemaColumn` 的 `schema.renderHeader` 改经 `#header` 插槽渲染（入参不变），不再触发 Element Plus `render-header` 废弃告警
