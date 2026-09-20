# rule-skill-admin-list-filter — 管理端列表 / 筛选

> **参考接入**：列表页硬约束（表格、筛选、操作列、Cell、刷新）。  
> **本仓同步**：与 kv3-admin `project-context` + `filter-panel-demo` **双向同步**（见 [SYNC.md](../SYNC.md)）。  
> **来源加强**：jx-dsp / oversea 列表专章；Mock 细则见 [rule-mock-isolation](../rule-mock-isolation/)，选择器见 [rule-skill-entity-selector](../rule-skill-entity-selector/)。

**类型**：Cursor Rule + Skill（`.mdc` + `SKILL.md`）

## 推进接入分数

| 维度         | 分         | 说明                          |
| ------------ | ---------- | ----------------------------- |
| 覆盖度       | 24/25      | 两仓 + kv3-admin 验证         |
| 可执行性     | 24/25      | 四要素与操作列可检查          |
| 可移植性     | 18/25      | 组件名可替换，模式通用        |
| Agent 可触发 | 14/15      | filter skill + List globs     |
| 单一真源     | 9/10       | 与 mock/selector 拆分后更清晰 |
| **合计**     | **89/100** |                               |

## 最佳实践（精炼）

### 页面与表格

1. Layer 薄壳 + `_module/XxxList`；单根 `page-*`；Dialog 在根内。
2. **表格四要素**：`TableWrap`（Dialog 内嵌可省）+ `class="do-inner-scroller page-table hide-table-border"` + `border`/`stripe` + `:max-height`（页面用 admin maxHeight hook；**弹层表**用 drawer 专用 hook，禁写死 px）。
3. 两种滚动（可选）：区内滚动（默认）vs 整页滚动（高筛选页，表不传 max-height）。

### 筛选 `DoFilterPanel`

- placeholder「不限」（禁「全部」作 placeholder）
- 顺序：**日期 → 文本 → 其它非 radio → radio**
- 范围日期用封装 `DateRange`；默认可清空
- 单选 ≤3 → 分段 radio（首项空=不限）；≥4/多选/长文案 → select
- `#ctl` 横向贴卡片右下；搜索 loading 勿撑宽按钮
- 离散控件变更可即查；禁盲目 `watch(listFilters)`（按仓约定）

### 操作列与动作分区

- `ops-column` 语义标记；对齐交给 EP `align`
- 行内：`plain` + `small`；**禁 link**；icon 在前、文字在后；删除用 icon、禁再写「删除」文案
- loading 按钮行内紧凑 `min-width`
- 表头「新建」；**批量**→ `#batch`；**页级**→ `#control` 或 PageHeader `#actions`（若产品启用页头）
- **PageHeader 策略按仓冻结**：有的仓默认禁用页头（顶栏+侧栏已表达身份）

### Cell

- 二值启停 → `CellState`（有切换接口则 `switchable`）
- 同实体名称+ID → `CellNameId`
- 应用名+包名+ID → `CellApp`
- 时间 → `CellDateTime`（若有）

### 排序 / 刷新 / 勾选

- 合同已支持排序且产品需要 → 必须有 UI（`sortable="custom"` 或 `DoSorter`）；Mock 按同参排序
- `search(true)` 回第 1 页；`refresh` 留页；轮询宜 silent
- 勾选列：仅批量或选择器模式

### 写操作确认

改数据动作发请求前二次确认；优先 `el-popconfirm`，必要时 MessageBox。

### 全局组件

已注册的 TableWrap / DoFilterPanel / Cell* / DateRange 等，业务页禁再 import。

### Demo / Example

开发态门控；生产 forbid-example；筛选 Demo 场景见本仓 filter-panel-demo skill。

## 本仓落点

- [`apps/kv3-admin/.cursor/rules/project-context.mdc`](../../../apps/kv3-admin/.cursor/rules/project-context.mdc)
- [`apps/kv3-admin/.cursor/skills/filter-panel-demo/SKILL.md`](../../../apps/kv3-admin/.cursor/skills/filter-panel-demo/SKILL.md)
- `apps/kv3-admin/docs/admin-list-page-pattern.md`

## 验收清单

- [ ] 新列表页满足四要素与筛选顺序
- [ ] 操作列形态符合 plain/small/icon 序
- [ ] Mock / 选择器分别遵守独立模块（不在本文件重复矛盾）
