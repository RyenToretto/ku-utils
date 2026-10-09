# rule-element-ui-vs-plus — Element UI ↔ Element Plus 移植与视觉对齐

> **参考接入**：供本项目或其他「Vue2 Element UI 与 Vue3 Element Plus 并存 / 迁移」的项目参考。  
> **本仓同步**：与 `apps/kv2-admin/.cursor/rules/element-ui-vs-plus.mdc` **双向同步**（见 [SYNC.md](../SYNC.md)）。

**类型**：Cursor Rule（`.mdc`，globs 自动挂载到 Element UI 端源码）

Element UI 对未知类名、`--el-*` 变量、prop **静默忽略**，从 Element Plus 端照抄样式 / 模板不报错、不生效，只能靠落点分层 + 脚本审计 + 计算样式对比兜住。

## 推进接入分数

| 维度         | 分         | 说明                                            |
| ------------ | ---------- | ----------------------------------------------- |
| 覆盖度       | 22/25      | 只要存在 EU / EP 双栈或迁移期就适用             |
| 可执行性     | 24/25      | 对照表 + `audit:ep` 脚本 + 验收步骤             |
| 可移植性     | 20/25      | 生成器 / 审计脚本需按目标仓路径调整             |
| Agent 可触发 | 14/15      | globs 挂 EU 端源码，description 覆盖搬运 / 对齐 |
| 单一真源     | 9/10       | 颜色在生成器、结构在 bridge、默认值全局一处     |
| **合计**     | **89/100** |                                                 |

## 最佳实践（精炼）

1. **对齐目标是金标端的实际渲染值**：EP 按需组件样式在应用样式之后加载、组件变量在组件选择器上重声明，金标端同优先级覆写可能是死代码；以浏览器计算样式为准，金标端死覆写顺手删。
2. **落点分层，各放一处**：颜色 / 弹层阴影 → 构建期生成器（chalk 字面量 → `--el-*` / `--ku-*`，未映射即失败，禁手写换色覆写，禁引入原始 chalk）；结构差异（尺寸、间距、圆角、状态）→ `element-ui-bridge.scss`；组件默认行为全局一处（周一开头 → 包装组件 `DateRange.vue`；弹层居中 → `_page-utils.scss` 全局 `.el-dialog__wrapper`）；页面样式按 EU DOM 写。
3. **移植必须换 DOM / 变量 / prop**，高频对照：

| Element Plus                                                             | Element UI                                                             |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `.el-input__wrapper`（内阴影描边）                                       | `.el-input__inner`（真 border，内距少 1px 补偿）                       |
| `.el-select__wrapper` / `.el-select__popper`                             | `.el-select .el-input__inner` / `.el-select-dropdown`                  |
| `.el-pager li.is-active` / `.el-popper__arrow`                           | `.el-pager li.active` / `.popper__arrow`                               |
| `.el-overlay-dialog` / `.el-drawer__footer`                              | `.el-dialog__wrapper` / 无（脚部放 body 内）                           |
| `.el-tooltip__trigger`                                                   | 无包裹层，`el-tooltip` 类挂子元素                                      |
| `var(--el-border)` / `--el-disabled-bg-color` / `--el-color-white`       | 不存在：写展开值或通用变量                                             |
| `show-after` / `hide-after` / `show-arrow`                               | `open-delay` / `close-delay` / `visible-arrow`                         |
| `teleported` / `align-center`                                            | `append-to-body` / 无                                                  |
| `el-drawer` 的 `class` / `:close-on-click-modal` / `#header` / `#footer` | `custom-class` / `:wrapper-closable` / `#title` / 无（脚部放 body 内） |
| `el-dialog` 的 `#header`                                                 | `#title`                                                               |

4. **已知语义差异主动处理**：根上组件变量 EU 不读、EP 重声明（以通用中性色为准）；下拉 / 日期 / popover 都挂 `.el-popper`，禁全局 `.el-popper > *`；EU 鼠标 `:focus` 沿用悬停色（回落静止态，仅 `:focus-visible` 描边），MessageBox 确认钮同挂 `--default` / `--primary` 且打开即聚焦；EU 通配规则（如 `.el-pagination span:not([class*=suffix])`）优先级高，覆写前先查命中规则；EU 选中 `value=""` 选项而 EP 视 `''` 为空显示占位（保留，属框架语义）；EU 原生滚动条占位，与 EP 浮层滚动条有约一条滚动条宽的差。
5. **脚本兜底**：`audit:ep` 扫 EU 端源码中不存在的 `.el-*` 类名、未声明且无 fallback 的 `var(--el-*)`、模板里的 EP 专有 prop，以及同名组件的 EP 专有 prop / 插槽（抽屉 `close-on-click-modal` / `#header` / `#footer`、对话框 `#header`），挂 `prebuild`。
6. **验收**：同路由同状态对比两端计算样式与几何，明暗各一遍，覆盖悬停、聚焦、展开的下拉 / 日期 / 对话框 / 确认框；新发现的差异回写对照表，能脚本化的补进审计脚本。

## 本仓落点

- 规则：`apps/kv2-admin/.cursor/rules/element-ui-vs-plus.mdc`（kv2 `project-context` 只留索引；kv3 `project-context` 写「覆写 EP 须确认生效」）
- 颜色生成器：`apps/kv2-admin/scripts/generate-element-theme.mjs`（`prepare:assets`）
- 结构对齐：`apps/kv2-admin/src/assets/styles/modules/element-ui-bridge.scss`
- 审计：`apps/kv2-admin/scripts/audit-ep-leftovers.mjs`（`pnpm audit:ep`，`prebuild` 自动跑）
- 默认行为包装：`apps/kv2-admin/src/components/DateRange.vue`（`firstDayOfWeek: 1`、`align="center"`）
- 四生约定：[admin-parity](../admin-parity/)；皮肤：[skill-theme-skin](../skill-theme-skin/)

## 验收清单

- [ ] `pnpm --filter @ku-utils/kv2-admin audit:ep` 为 0
- [ ] 改动涉及的组件在明 / 暗下与 kv3 计算样式、几何一致（含悬停与弹层）
- [ ] 新差异已回写 rule 对照表与本模块
