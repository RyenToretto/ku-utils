---
'@ku-utils/r-custom-columns': minor
---

`schemaToColumn` 把 schema `minWidth` 映射为 antd 列 `minWidth`（不再当作固定 `width`），余宽可按需分配；移除废弃别名 `SchemaColumn`、`schemasToAntdColumns`，统一用 `schemasToColumns`；peer `antd` 提至 `>=5.21.0`（列 `minWidth` 起始版本）
