---
name: selector
description: >-
  在 ka-admin 新建或改造分页实体选择器（xxx-list 双模 + xxx-selector CVA + 薄壳 dialog-select-xxx）。
  挑业务实体、对照 schoolResource 金标、写 Demo 时使用。
---

# 实体选择器接入

开始前阅读：

- 规则：`.cursor/rules/entity-selector.mdc`（金标细节真源）
- 列表指南：`docs/admin-list-page-pattern.md`
- **金标真源**：`src/modules/_example/schoolResource/_module/school-resource-list.ts` + `dialog-select-school-resource.ts` + `school-selector.ts`
- 最佳实践：仓库根 `docs/best-practice/rule-skill-entity-selector/`

Demo 仅开发态 `useExample`；生产构建换 stubs。

## 命名（强制）

| 用途     | 命名                                                              |
| -------- | ----------------------------------------------------------------- |
| 列表双模 | **`xxx-list.ts`**                                                 |
| 控件     | **`xxx-selector.ts`**（`ControlValueAccessor`）                   |
| 薄壳弹层 | **`dialog-select-xxx.ts`**                                        |
| Demo     | `xxx-selector-demo-layer.ts` + `dialog-edit-xxx-selector-demo.ts` |

## List 双模（强制）

**禁止**在 `dialog-select-xxx` 内写表格；筛选 + 表 + 分页 + 勾选全在 `xxx-list`。

### `xxx-list` 选择器 inputs

`enableSelector` / `isMultiple` / `inDialog` / `checkedRows` / `defaultPageSize` / 业务锁定筛选项

### 行为要点

- `injectTableQuery({ immediate: false })`；`ngOnInit` 回显 `checkedRows` 后 `query.reset(initialFilters(), defaultPageSize())`
- 筛项锁定：`[nzDisabled]`，**禁止** `@if` 藏掉；`transformQuery` 写死约束
- 有写接口 → 选择器态保留新建（操作列表头同形文案按钮）/ 行内编辑删除；勿卸 dialog
- `onError` → `loadFailed.emit()`；表体按 `tableLoadFailed()` 出失败态 + 重试

### `dialog-select-xxx` 薄壳

- `nz-drawer` `nzWrapClassName="drawer-model-selector"` + footer；`[open]` 驱动，`(confirmed)` / `(cancelled)` 回传
- 内容 `*nzDrawerContent` 挂 `<ka-xxx-list [enableSelector]="true" [inDialog]="true" (selectionChange)>`
- **禁止**壳内 `injectTableQuery`；打开瞬间 `untracked` 快照已选

### `xxx-selector`

- 假 `nz-select`：`(nzOpenChange)` → `setOpenState(false)` + 开抽屉
- 视图含 `ngModel` 时 `viewProviders: [{ provide: ControlContainer, useValue: null }]`
- 值：`{ id, label, item }`（`id: string`）；必填用 `requiredPick`

## CR 清单

- [ ] 表格逻辑只在 `xxx-list` 一份
- [ ] `dialog-select-xxx` 无 `injectTableQuery`
- [ ] 接口支持新建/编辑/删除 → 选择器态同样可操作
- [ ] 筛项 lock 用 disabled，不藏
- [ ] Demo：筛选单多选 + dialog-edit
- [ ] `pnpm --filter @ku-utils/ka-admin typecheck`
