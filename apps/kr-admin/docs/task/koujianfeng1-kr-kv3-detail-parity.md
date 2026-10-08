# koujianfeng1-kr-kv3-detail-parity

> kr-admin（3333）对照 kv3 金标（3111）：除 Header 已收口外，按「组件 → 壳层 → 叶子页」抠交互与视觉细节；**一叶/一批一查一修一提交**。

## 范围

- 金标：`apps/kv3-admin`（端口 3111）
- 目标：`apps/kr-admin`（端口 3333）
- 验收：Chrome Debug CDP `:9222`；截图落 `.playwright-mcp/logs/`

## A. 共享组件矩阵（先组件后页面）

| ID | 组件 | kv3 | kr | 验收要点 | 状态 |
| --- | --- | --- | --- | --- | --- |
| C01 | HeaderProfileMenu + AppearancePicker | ✅ | ✅ | 侧向外观、切肤、瞬时关闭、无残留 | ✅ 本轮收口 |
| C02 | BrandLogoMark / AdminVersionLogo | ✅ | ✅ | 无省略、完整 logo、更新角标 | ⚠️ 跟壳层复验 |
| C03 | DoFilterPanel | ✅ | ✅ | 折叠/按钮槽/离散即查/disableFold | ⭕️ |
| C04 | TableWrap + DoTableHeader | ✅ | ✅ | 工具栏、自定义列入口、高度 | ⚠️ 曾修，复验 |
| C05 | ListPaginationBar ≈ BasePagination | ✅ | ✅ | 总数/页码/每页/刷新 | ⭕️ |
| C06 | CellNameId / CellState / CellDateTime | ✅ | ✅ | 展示、开关、时间格式 | ⭕️ |
| C07 | DoSelector / DoNamePattern / DoWordsTag | ✅ | ✅ | 选择/模板/标签交互 | ⭕️ |
| C08 | DoNumberSetter / DoTxtSetter / DateRange | ✅ | ✅ | 行内编辑、日期范围 | ⭕️ |
| C09 | DialogPreviewVideo | ✅ | ✅ | 打开/关闭 destroyOnHidden | ⭕️ |
| C10 | ScheduleTimeWeekPicker | ✅ | ✅ | 周时段选择 | ⭕️ |
| C11 | DoSorter / DoFormSection / CellApp | ✅ | ❌/弱 | 仅 uiKit 用到则对齐；否则记缺口 | ⭕️ 盘点 |

## B. 壳层

| ID | 项 | 验收要点 | 状态 |
| --- | --- | --- | --- |
| S01 | BaseHeader | Logo / Demo Tab / 账户菜单 / 外观 | ⚠️ C01 已修，整条复验 |
| S02 | DomainModuleShell | aside 宽、主区 padding 20、gap | ⭕️ |
| S03 | SideMenu | 展开链、高亮、图标、暗色 | ⭕️ |
| S04 | 皮肤桥接 | `--ku-*` / dark class / Ant token | ⭕️ |

## C. 叶子页（35）— 逐页：加载 → 筛选/操作 → 弹层 → 暗色 → 截图对照

### C1 示例管理（6）

| ID | 路径 | 关键交互 | 状态 |
| --- | --- | --- | --- |
| L01 | `/example/simple/list` | 搜/重置/新建/编辑/删/分页/开关 | ⭕️ |
| L02 | `/example/simple/batch-select` | 表外全选、批量条 | ⭕️ |
| L03 | `/example/school/list` | 批量启停、开关、编辑 | ⭕️ |
| L04 | `/example/school-selector/demo` | 选择器双模 | ⭕️ |
| L05 | `/example/clazz/list` | 列表+弹层 | ⭕️ |
| L06 | `/example/club/list` | 批量按钮色、列表+弹层 | ⭕️ |

### C2 基础组件（8）

| ID | 路径 | 状态 |
| --- | --- | --- |
| U01–U08 | `ui-kit/panel|cells|max-height|name-pattern|selector|words-tag|preview-video|schedule-week` | ⭕️ |

### C3 筛选面板（9）

| ID | 路径 | 状态 |
| --- | --- | --- |
| F01–F09 | `do-filter-panel/buttons-1..4|rows-1..3|rows-50|layout-fold` | ⭕️ |

### C4 自定义列（8）

| ID | 路径 | 状态 |
| --- | --- | --- |
| CC01–CC08 | `custom-columns/basic|el-attrs|slots|nested|version|slot-components|header-slots|fixed-cols` | ⭕️ |

### C5 多级导航（4）

| ID | 路径 | 状态 |
| --- | --- | --- |
| N01–N04 | `nest-menus/.../page-alpha|beta|gamma|delta` | ⭕️ |

## 执行约定

1. **顺序**：先提交 C01 外观收口 → S01–S04 壳层 → C03–C11 共享组件（按 uiKit 页驱动）→ L → U → F → CC → N
2. **单次提交粒度**：一个叶子或一个共享组件缺陷簇；禁止巨型 PR 式提交
3. **通过标准**：与 kv3 同路径截图对照；关键交互可点通；无控制台致命报错；暗色无残留层
4. **跳过**：仅框架差异（El vs Ant 控件皮）且不影响信息架构/交互语义的，台账标 `⏭` 并写一句理由

## 进度日志

| 日期 | 项 | 结论 | commit |
| --- | --- | --- | --- |
| 2026-10-08 | C01 外观切肤/关闭 | 真实 mousedown 切肤 + 瞬时卸层 | （待） |
| 2026-10-08 | L03 学校 Mock 持久化 | 启停/增删改可验证 | （本提交） |
