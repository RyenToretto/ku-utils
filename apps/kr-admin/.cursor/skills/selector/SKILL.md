---
name: selector
description: >-
  在 kr-admin 新建或改造分页实体选择器（XxxList 双模 + XxxSelector + 薄壳 DialogSelectXxx）。
  挑业务实体、对照 schoolResource 金标、写 Demo 时使用。
---

# 实体选择器接入

开始前阅读：

- 规则：`.cursor/rules/entity-selector.mdc`（金标细节真源）
- 列表指南：`docs/admin-list-page-pattern.md`
- **金标真源**：`src/modules/_example/schoolResource/_module/SchoolResourceList.tsx` + `DialogSelectSchoolResource.tsx` + `SchoolSelector.tsx`
- 最佳实践：仓库根 `docs/best-practice/rule-skill-entity-selector/`

Demo 仅 `VITE_APP_USE_EXAMPLE=1`；生产必须 `0`。

## 命名（强制）

| 用途     | 命名                                                         |
| -------- | ------------------------------------------------------------ |
| 列表双模 | **`XxxList.tsx`**                                            |
| 控件     | **`XxxSelector.tsx`**（受控 `value` / `onChange`）           |
| 薄壳弹层 | **`DialogSelectXxx.tsx`**                                    |
| Demo     | `XxxSelectorDemoLayer.tsx` + `DialogEditXxxSelectorDemo.tsx` |

## List 双模（强制）

**禁止**在 `DialogSelectXxx` 内写表格；筛选 + 表 + 分页 + 勾选全在 `XxxList`。

### `XxxList` 选择器 props

`enableSelector` / `isMultiple` / `inDialog` / `checkedRows` / `defaultPageSize` / 业务锁定筛选项；回调 `onChange` / `onLoaded` / `onLoadFailed`

### 行为要点

- `useTableQuery({ immediate: !enableSelector })`；表高 `useAdminTableMaxHeight(pageSelector, inDialog ? 360 : 400)`
- 筛项锁定：`disabled`，**禁止**条件渲染藏掉；`transformQuery` 写死约束
- 有写接口 → 选择器态保留新建（操作列表头同形文案按钮）/ 行内编辑删除；勿卸 Dialog
- `onError` → `onLoadFailed?.()`；`Table` 的 `locale.emptyText` 按 `tableLoadFailed` 出失败态 + 重试

### `DialogSelectXxx` 薄壳

- antd `Drawer` `className="drawer-model-selector"` + `footer`；`open` 受控，`onConfirm` / `onCancel` 回传
- 内挂 `<XxxList enableSelector inDialog onChange={…} />`；`destroyOnHidden` 关闭即销毁
- **禁止**壳内 `useTableQuery`；打开瞬间 `useEffect` 快照已选

### `XxxSelector`

- 假 antd `Select`：`open={false}` + `onOpenChange` 开抽屉
- 多选 `maxTagCount={1}` + `Popover` 悬浮 tags 浮层
- 值：`{ id, label, item }`（`id: string`）

## CR 清单

- [ ] 表格逻辑只在 `XxxList` 一份
- [ ] `DialogSelectXxx` 无 `useTableQuery`
- [ ] 接口支持新建/编辑/删除 → 选择器态同样可操作；新建在操作列表头且与页面态同形
- [ ] 筛项 lock 用 disabled，不藏
- [ ] Demo：筛选单多选 + DialogEdit
- [ ] `pnpm --filter @ku-utils/kr-admin typecheck`
