---
'@ku-utils/r-custom-columns': minor
---

`schema.fixed` 与 Vue 包同义，只表示「弹窗中不可取消勾选」，`schemaToColumn` 不再据此把列钉到左侧；需要钉列请用 `antdAttrs: { fixed: 'left' }`
