---
name: selector
description: >-
  在 kv2-admin 新建或改造分页实体选择器（XxxList 双模 + XxxSelector + 薄壳 DialogSelectXxx）。
  挑业务实体、对照 schoolResource 金标、写 Demo 时使用。
---

# 实体选择器接入

开始前阅读：

- 规则：`.cursor/rules/entity-selector.mdc`（金标细节真源）
- 列表指南：`docs/admin-list-page-pattern.md`
- **金标真源**：`src/modules/_example/schoolResource/_module/SchoolResourceList.vue` + `DialogSelectSchoolResource.vue` + `SchoolSelector.vue`
- 最佳实践：仓库根 `docs/best-practice/rule-skill-entity-selector/`

Demo 仅 `VITE_APP_USE_EXAMPLE=1`；生产必须 `0`。

## 命名（强制）

| 用途     | 命名                                                         |
| -------- | ------------------------------------------------------------ |
| 列表双模 | **`XxxList.vue`**                                            |
| 控件     | **`XxxSelector.vue`**                                        |
| 薄壳弹层 | **`DialogSelectXxx.vue`**                                    |
| Demo     | `XxxSelectorDemoLayer.vue` + `DialogEditXxxSelectorDemo.vue` |

## List 双模（强制）

**禁止**在 `DialogSelectXxx` 内写表格；筛选+表+分页+勾选全在 `XxxList`。

### `XxxList` 选择器 props

`enableSelector` / `isMultiple` / `inDialog` / `enableCache` / `checkedIds` / `defaultPageSize` / 业务锁定筛选项

### 行为要点

- 页面态：`useAdminTableMaxHeight` + `useTableQuery({ immediate: true, refreshOnActivated: true })`
- 选择器态：`useDrawerPickListMaxHeight` + `immediate: false`；`show()` 后 `search(true)`
- 筛项锁定：`:disabled`，**禁止** `v-if` 藏掉
- 有写接口 → 选择器态保留新建（操作列表头同形文案按钮）/ 行内编辑删除；勿卸 Dialog
- `onError` → `emit('load-failed')`；`#empty` 按 `tableLoadFailed` 失败态 + 重试

### `DialogSelectXxx` 薄壳

- drawer.`drawer-model-selector` + footer + `show()`
- 内挂 `<XxxList enable-selector in-dialog @change @loaded />`
- **禁止**外壳 `v-loading`；**禁止**壳内 `useTableQuery`
- `@opened` → `listRef.remeasureAfterLayout()`

### `XxxSelector`

- 假 `el-select` + popper 隐藏 + `DialogSelectXxx.show`
- `v-model`: `{ id, label, item }`（`id: string`）

## CR 清单

- [ ] 表格逻辑只在 `XxxList` 一份
- [ ] `DialogSelectXxx` 无 `useTableQuery`
- [ ] 接口支持新建/编辑/删除 → 选择器态同样可操作；新建在操作列表头且与页面态同形
- [ ] 筛项 lock 用 disabled，不藏
- [ ] Demo：筛选单多选 + DialogEdit
- [ ] `pnpm --filter @ku-utils/kv2-admin typecheck`
