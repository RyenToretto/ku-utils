# rule-skill-entity-selector — 实体选择器

> **参考接入**：分页实体点选的金标。  
> **来源**：oversea `selector-best-practices`（双模 List）+ jx-dsp 选择器专章（防漏表）。  
> **参考模块**：本仓 kv3-admin 有部分 Demo；完整金标以 oversea / 本文为准。

**类型**：Cursor Rule + Skill（`.mdc` + 可选 `SKILL.md`）

## 推进接入分数

| 维度         | 分         | 说明                                    |
| ------------ | ---------- | --------------------------------------- |
| 覆盖度       | 21/25      | oversea 金标；jx 百科；kv3 Demo         |
| 可执行性     | 23/25      | 文件命名与禁止项清晰                    |
| 可移植性     | 18/25      | 依赖 TableWrap/DoFilterPanel 等同族组件 |
| Agent 可触发 | 14/15      | globs `*Selector*` + skill              |
| 单一真源     | 8/10       | 双模 vs 旧「Dialog 内完整表」需统一     |
| **合计**     | **84/100** |                                         |

## 最佳实践（精炼）

### 何时必须用选择器

控件在**挑业务实体**（有 list/page 合同、有展示名）→ 必须 `XxxSelector`。  
**禁止**筛/表单用手填 `*Id` / 包名；无现成选择器则**先建**再引用。  
编辑已用选择器时，筛选同条件必须同形（可 `clearable` = 不限）。

### 分页实体 → List 双模金标（推荐强制）

请求含 `pageNum`+`pageSize` 或响应含 `total` / 分页结构时：

| 文件                  | 职责                                                |
| --------------------- | --------------------------------------------------- |
| `XxxList.vue`         | **唯一**表格逻辑；页面 CRUD + `enableSelector` 点选 |
| `XxxSelector.vue`     | 假 `el-select`（隐藏原生下拉）+ 打开抽屉            |
| `DialogSelectXxx.vue` | **薄壳** header/footer/`show()`，内挂 `XxxList`     |

**禁止**：在 `DialogSelectXxx` 内再写一套 `DoFilterPanel`+`el-table`+query hook。  
**禁止**：`ScrollSelect` / remote `el-select` 截断首屏冒充分页。

### 回传形状

`{ id, label, item }`（单选对象/`null`，多选数组）；`id` 类型跟合同（常用 `string`）。

### Demo（强制）

每种选择器独立 Demo 页（开发态 Example 门控）：筛选区单选+多选；编辑弹层回填验证。禁止多选择器堆同一聚合页。

### 抽屉表高

根 class `drawer-model-selector`；`useDrawerPickListMaxHeight`；禁写死 px；禁对弹层表用页面 `useAdminTableMaxHeight`；`@opened` → `remeasureAfterLayout()`。

## 验收清单

- [ ] 外键筛选项无手填 ID
- [ ] 分页实体选择器只有一份 List 逻辑
- [ ] 每选择器有独立 Demo
