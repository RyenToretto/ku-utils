---
name: selector
description: 在 kv3-admin 新建或改造分页实体选择器（List 双模）。挑业务实体、XxxSelector、DialogSelectXxx 时使用。
---

# 实体选择器接入

## 何时用本 Skill

新建/改造「分页 list 选实体」控件时。静态枚举用 `DoSelector`，不要走本流程。

## 步骤

1. **确认合同**：list 是否分页（`pageNum`/`pageSize`/`total`）。是 → 双模；否 → 评估是否误用分页实体模式。
2. **复用 List**：在既有 `XxxList.vue` 加 `enableSelector` + `useRowSelector`；**禁止**在 Dialog 内复制第二套表。
3. **薄壳 Dialog**：`DialogSelectXxx.vue` — `el-drawer.drawer-model-selector` + header/footer + 内挂 List；对外 `show()` / confirm 回传 `{ id, label, item }`。
4. **触发器**：`XxxSelector.vue` — 假 select 打开 Dialog；筛选项可 `clearable`。
5. **表高**：List 在 drawer 内用 `useDrawerPickListMaxHeight`，`@opened` 调 `remeasureAfterLayout()`。
6. **Demo**：Example 下独立页验证单选/多选/回填；业务页禁止手填 ID。
7. **对照金标**：`src/modules/_example/schoolResource/_module/`。

## 禁止项速查

- Dialog 内完整 `DoFilterPanel`+`el-table`
- 手填 `*Id` 代替选择器
- 写死 drawer 表 `max-height` px
- 用页面 `useAdminTableMaxHeight` 量 drawer 表
