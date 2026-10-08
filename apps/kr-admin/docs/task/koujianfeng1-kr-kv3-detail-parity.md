# koujianfeng1-kr-kv3-detail-parity

> kr-admin（3333）对照 kv3 金标（3111）：按「共享组件 → 壳层 → 叶子页 → 场景」抠交互与视觉细节；**一个缺陷簇一查一修一提交**。

## 范围

- 金标：`apps/kv3-admin`（端口 3111）
- 目标：`apps/kr-admin`（端口 3333）
- 验收：Chrome Debug CDP `:9222`，**真实鼠标事件**（`Input.dispatchMouseEvent`）点击，不用 `el.click()` 代替——后者绕过 mousedown，曾漏掉外观切肤缺陷
- 截图：`.playwright-mcp/logs/`

## A. 共享组件 / 基础设施

| ID  | 组件                                     | 验收要点                                                  | 状态                                                  |
| --- | ---------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------- |
| C01 | HeaderProfileMenu + AppearancePicker     | 侧向外观、切肤、瞬时关闭、无残留                          | ✅                                                    |
| C02 | BrandLogoMark / AdminVersionLogo         | 完整 logo、更新角标                                       | ✅                                                    |
| C03 | DoFilterPanel                            | 折叠/按钮槽/离散即查/disableFold                          | ✅ 离散即查（C12）；折叠/展开高度、label auto 已验    |
| C04 | TableWrap + DoTableHeader                | 工具栏、自定义列入口、高度                                | ✅ 悬停配置列表 + 配置抽屉与 kv3 逐像素/全流程一致    |
| C05 | ListPaginationBar                        | 总数/页码/每页/跳页/刷新（刷新按需，对齐 enable-refresh） | ✅                                                    |
| C06 | CellNameId / CellState / CellDateTime    | 开关确认、只读指示器、时间格式                            | ✅ 列表创建时间统一 CellDateTime                      |
| C07 | DoSelector / DoNamePattern / DoWordsTag  | 选择/模板/标签增删与上限提示                              | ✅ 远程懒加载+缓存；插入位/浮层；WordsTag 按 kv3 重写 |
| C08 | DoNumberSetter / DoTxtSetter / DateRange | 行内编辑、日期范围                                        | ⭕️                                                    |
| C09 | DialogPreviewVideo                       | 打开/关闭/销毁                                            | ✅ 挂载即起播、真实元信息                             |
| C10 | ScheduleTimeWeekPicker                   | 周时段拖选                                                | ✅ 拖选/单击/外部松开/清空/汇总一致                   |
| C11 | DoSorter / DoFormSection / CellApp       | kv3 有、kr 缺：盘点是否被 Demo 引用                       | ⭕️                                                    |
| C12 | useTableQuery.setListFilters             | 同步写 filtersRef，离散筛后 search 不读旧值               | ✅                                                    |
| C13 | 确认框 / message                         | antd 静态方法在 React 19 下不渲染 → `@/plugins/antdApp`   | ✅                                                    |
| C14 | Mock 增删改持久化                        | 删除提示成功但行不消失（kv3 同样）；须三端成对            | ⭕️                                                    |
| C15 | useRowSelector + DoSelectCell            | 单/多选、表头半选/全选、跨页保留、回显                    | ✅                                                    |
| C16 | axios 取消请求                           | 被中止请求不弹 canceled（三端）                           | ✅                                                    |
| C17 | useTableQuery 竞态                       | 丢弃被中止请求结果；loading 不提前结束                    | ✅                                                    |
| C18 | 学校选择器 + 抽屉                        | 折叠 tag、悬浮面板、回显、确认不清空、已选计数            | ✅                                                    |

## B. 壳层

| ID  | 项                  | 验收要点                                                                                                                                                                                                                                                                                                  | 状态        |
| --- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| S01 | BaseHeader          | Logo / Demo Tab / 账户菜单 / 外观                                                                                                                                                                                                                                                                         | ✅          |
| S02 | DomainModuleShell   | aside 220、主区 padding 20                                                                                                                                                                                                                                                                                | ✅ 度量一致 |
| S03 | SideMenu            | 展开链、高亮、图标、暗色、四级导航                                                                                                                                                                                                                                                                        | ⭕️          |
| S04 | 皮肤桥接 / 样式迁移 | `--ku-*` / dark / Ant token / 弹层暗色；`elTable.scss`、`_page-utils.scss` 大量 `.el-*` 选择器在 antd 下失效（斑马纹、行高、筛选区、分页样式与 kv3 有差）；表格/筛选区/卡片/antd 全局 token（skin/tokens）已迁，分页/下拉/聚焦已迁，余 elRadio/app-shell 与 `_page-utils` drawer-pick 的失效 `.el-*` 样式 | ⚠️          |
| S05 | Button 文案         | 两字中文不插空（`button.autoInsertSpace`）                                                                                                                                                                                                                                                                | ✅          |

## C. 叶子页场景清单

### 列表页标准场景（L 组每页逐条过）

| #   | 场景                                              |
| --- | ------------------------------------------------- |
| s1  | 首屏加载、loading、空态、失败重试                 |
| s2  | 文本筛选 + 回车 / 点搜索                          |
| s3  | 离散筛选（Radio/Select）即查                      |
| s4  | 重置回默认并重查                                  |
| s5  | 分页：翻页 / 每页条数 / 跳页 / 刷新               |
| s6  | 勾选 → 批量按钮可用 → 批量确认 → 提示 → 清空勾选  |
| s7  | 行内开关 → 确认 → 状态翻转 → 提示                 |
| s8  | 新建弹层：打开 / 校验 / 提交 / 提示 / 刷新 / 关闭 |
| s9  | 编辑弹层：回填 / 提交 / 关闭后再开干净            |
| s10 | 删除 → 确认 → 提示 → 列表刷新                     |
| s11 | 暗色下同页无残留、弹层跟随暗色                    |
| s12 | 控制台无 error / warning                          |

### C1 示例管理（6）

| ID  | 路径                            | 已过                                      | 状态 |
| --- | ------------------------------- | ----------------------------------------- | ---- |
| L01 | `/example/simple/list`          | s1–s5 s7–s10 s12                          | ✅   |
| L02 | `/example/simple/batch-select`  | s1–s6 s12（独立组件，对齐 kv3）           | ✅   |
| L03 | `/example/school/list`          | s1–s10 s12                                | ✅   |
| L04 | `/example/school-selector/demo` | 单/多选、折叠、悬浮删除、表单校验回填 s12 | ✅   |
| L05 | `/example/clazz/list`           | s1 s7 s8 s9 s10 s12                       | ✅   |
| L06 | `/example/club/list`            | s1 s6–s10 s12                             | ✅   |

### C2 基础组件（8）

| ID  | 路径                   | 状态                                                                       |
| --- | ---------------------- | -------------------------------------------------------------------------- |
| U01 | `ui-kit/panel`         | ✅（分页跳页器常驻，与 kv3 一致）                                          |
| U02 | `ui-kit/cells`         | ✅                                                                         |
| U03 | `ui-kit/max-height`    | ✅ 折叠/每页/窗口缩放重算，无外层滚动                                      |
| U04 | `ui-kit/name-pattern`  | ✅ 逐像素 + 插入结果一致                                                   |
| U05 | `ui-kit/selector`      | ✅（下拉面板已对齐 el-select-dropdown；弹层小箭头 ⏭ antd Select 无此能力） |
| U06 | `ui-kit/words-tag`     | ✅ 13 步交互输出一致                                                       |
| U07 | `ui-kit/preview-video` | ✅（关闭按钮尺寸/位置 ⏭ 控件差异）                                         |
| U08 | `ui-kit/schedule-week` | ✅                                                                         |

### C3 筛选面板（9）

| ID      | 路径                                   | 状态 |
| ------- | -------------------------------------- | ---- |
| F01–F04 | `do-filter-panel/buttons-1..4`         | ✅   |
| F05–F08 | `do-filter-panel/rows-1..3`、`rows-50` | ✅   |
| F09     | `do-filter-panel/layout-fold`          | ✅   |

### C4 自定义列（8）

| ID        | 路径                                | 状态 |
| --------- | ----------------------------------- | ---- |
| CC01–CC08 | `custom-columns/basic … fixed-cols` | ✅   |

### C5 多级导航（4）

| ID      | 路径                                | 状态 |
| ------- | ----------------------------------- | ---- |
| N01–N04 | `nest-menus/.../page-alpha … delta` | ⭕️   |

## 执行约定

1. **顺序**：L（示例管理）→ U → F → CC → N；共享组件缺陷在首个暴露它的叶子里修
2. **提交粒度**：一个缺陷簇一个 commit；台账进度单独 docs commit
3. **通过标准**：与 kv3 同路径对照；场景清单逐条点通；控制台干净；暗色无残留
4. **跳过**：仅控件皮差异（El vs Ant）且不影响信息架构/交互语义的标 `⏭` 并写理由

## 进度日志

| 日期       | 项                       | 结论                                                                                                                                                                                                                                                                  | commit                          |
| ---------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 2026-10-08 | C01 外观切肤/关闭        | 真实 mousedown 切肤 + 瞬时卸层                                                                                                                                                                                                                                        | a25b773                         |
| 2026-10-08 | C12 筛选竞态             | setListFilters 同步写 ref                                                                                                                                                                                                                                             | f3b68dc                         |
| 2026-10-08 | L03 学校 Mock 持久化     | 启停/增删改可验证                                                                                                                                                                                                                                                     | 9cf63b4                         |
| 2026-10-08 | S05 Button 插空          | `button.autoInsertSpace: false`                                                                                                                                                                                                                                       | 6c9d9f6                         |
| 2026-10-08 | C13 删除/批量/提示无响应 | 静态方法 → App 上下文实例 + React 19 补丁                                                                                                                                                                                                                             | 见下一提交                      |
| 2026-10-08 | L01/L03/L06 开关不翻转   | `patchRow` 本地改行，不重拉                                                                                                                                                                                                                                           | 69bc88f                         |
| 2026-10-08 | 弹窗校验未捕获异常       | `validateFields().catch`                                                                                                                                                                                                                                              | e6561f5                         |
| 2026-10-08 | Select 废弃 API          | `onOpenChange`                                                                                                                                                                                                                                                        | c8ea217                         |
| 2026-10-08 | C06 创建时间             | CellDateTime                                                                                                                                                                                                                                                          | 90c2e47                         |
| 2026-10-08 | 示例/学校/社团/班级弹窗  | 标题·字段·校验·文案对齐 kv3                                                                                                                                                                                                                                           | 8fa34bd c4dfb08 15d6626 e14d33f |
| 2026-10-08 | C15 L02 表外全选         | 移植 useRowSelector；独立 BatchSelectList；补 enableDoHeader                                                                                                                                                                                                          | cfad175                         |
| 2026-10-08 | C18 学校抽屉             | 确认不再清空已选；死代码删除                                                                                                                                                                                                                                          | 257ffb8                         |
| 2026-10-08 | C18 学校选择器           | 折叠/悬浮面板/标签格式                                                                                                                                                                                                                                                | 0486d60                         |
| 2026-10-08 | C16 canceled 提示        | 三端 axios 拦截器跳过取消                                                                                                                                                                                                                                             | db5ada7                         |
| 2026-10-08 | L06 社团勾选             | useRowSelector + 加载后清空                                                                                                                                                                                                                                           | 7407c16                         |
| 2026-10-08 | C17 查询竞态             | 丢弃旧结果、loading 守卫                                                                                                                                                                                                                                              | 5e273a5                         |
| 2026-10-08 | s1 空态/失败             | Empty + 重试                                                                                                                                                                                                                                                          | 6a92fa8                         |
| 2026-10-08 | L01–L06 s11 暗色         | 6 页无浅色残留，弹窗暗底                                                                                                                                                                                                                                              | —                               |
| 2026-10-08 | 表格 scroll.y 溢出       | 扣除表头与边框，列表页无外层滚动条                                                                                                                                                                                                                                    | 8442da4                         |
| 2026-10-08 | U01 panel                | CellState 默认尺寸；行内开关/数量原地更新；去刷新                                                                                                                                                                                                                     | 513eb9d 9dcb4ed                 |
| 2026-10-08 | S04 表格皮肤             | components.Table 走 --ku-*；斑马纹；删 elTable.scss；去 bordered                                                                                                                                                                                                      | ccc60a6                         |
| 2026-10-08 | S04 筛选面板             | 折叠「更多筛选」、labelWidth、卡片/按钮几何逐像素对齐                                                                                                                                                                                                                 | 8a4e8d8                         |
| 2026-10-08 | DoTxtSetter              | 小号次要色 + 悬停态                                                                                                                                                                                                                                                   | b9cad2d                         |
| 2026-10-08 | 表体常驻滚动条           | antd scroll.y 强制 overflow-y:scroll，⏭ 控件差异                                                                                                                                                                                                                      | —                               |
| 2026-10-08 | S04 antd 全局主题        | skin 新增 tokens 导出；kr 主题由其生成，暗色钉回品牌色                                                                                                                                                                                                                | c5d99b5 bbf93ac c81f8b3         |
| 2026-10-08 | U02 cells                | Card 对齐 el-card；--ku-bg-elevated 不存在致白底；文案                                                                                                                                                                                                                | 12d42cc                         |
| 2026-10-08 | kv3/kv2 暗色缺陷         | 不存在 token 白卡片；单选高亮行暗色浅底                                                                                                                                                                                                                               | 4b03d77 61e08b9 6af9eae ee50058 |
| 2026-10-08 | U03 max-height           | 默认按钮误用 ghost 不可见；去刷新                                                                                                                                                                                                                                     | 73b58d4                         |
| 2026-10-08 | U04 DoNamePattern        | 插入位置/连接符、芯片样式、默认提示、外部点击关闭                                                                                                                                                                                                                     | bc1dffa                         |
| 2026-10-08 | U05 Alert / DoSelector   | 状态色接皮肤、Alert 对齐；远程懒加载；删别名页                                                                                                                                                                                                                        | 2bb61c1 6a2fb25                 |
| 2026-10-08 | U06 DoWordsTag           | 按 kv3 重写                                                                                                                                                                                                                                                           | e36c4ba                         |
| 2026-10-08 | U07 主题 / 预览弹窗      | 8px 圆角、默认按钮色、分页 2px、Modal 对齐 el-dialog；起播与元信息                                                                                                                                                                                                    | 173c656 536e158                 |
| 2026-10-08 | U08 schedule-week        | h3 标题与按钮间距                                                                                                                                                                                                                                                     | eafa781                         |
| 2026-10-08 | 备注                     | kv2-admin `typecheck` 既有 84 个 TS 错误（与本任务无关，另立任务）                                                                                                                                                                                                    | —                               |
| 2026-10-08 | 列表表单弹窗             | Modal 居中不超视口、footer 间距 12、Form 无冒号/项距 18；示例管理分页去刷新                                                                                                                                                                                           | 902d128 e111a0a                 |
| 2026-10-08 | 批量操作按钮             | el plain 明暗配色、间距按页（社团 gap 8+ml 12 / 学校 gap 4+ml 5）；按钮字重 500、small 12/11/7                                                                                                                                                                        | d36dcfb                         |
| 2026-10-08 | 列表表格几何             | 单元格行高 23、表体贴边、工具栏 control 最小高 32.5、表尾 8/8/4 无分隔线；6 页 table-wrap 与 kv3 差 ≤1px（表头亚像素）                                                                                                                                                | ca6de1c                         |
| 2026-10-08 | S04 分页条               | is-background 页码配色/hover/禁用；「前往 N 页」常驻 + 钳位（9→2、0/abc→1，失焦与回车）；N条/页；刷新尺寸 46×32 + loading；删失效 elPagination.scss                                                                                                                   | db403b3                         |
| 2026-10-08 | Select 下拉              | 34 高选项、20/32 内距、选中品牌色 700 无底、悬停 fill 底、描边 + 6px 留白；暗色走 skin token（kv3 暗色为 EP 自带色板，不追同值）                                                                                                                                      | 458fa4d                         |
| 2026-10-08 | 聚焦/按钮投影            | `controlOutlineWidth: 0`：输入聚焦仅描边、按钮无 2px 底影                                                                                                                                                                                                             | 9907ee1                         |
| 2026-10-08 | F01–F09 筛选面板         | 控件默认宽 194、`labelWidth="auto"`（rows-50 量得 76）、操作按钮间距 12、小号单选 48×24 12/500/r8、demo 下拉补「不限」；删失效 elInput.scss                                                                                                                           | 76207b3                         |
| 2026-10-08 | F 组 fill-viewport       | demo 页根沿用 page-simple-example-list；表格最小高按整表（含表头）200 计，展开后与 kv3 差 1px；layout-fold 无外层滚动                                                                                                                                                 | eb1474c                         |
| 2026-10-08 | U01 DoSelector 宽        | 去掉内置 minWidth 160，状态项 220 与 kv3 一致                                                                                                                                                                                                                         | 4ecded1                         |
| 2026-10-08 | ⏭ loading 时序           | React dev 下 Spin 晚一帧出现（渲染开销 + Spin effect 切换），不影响语义                                                                                                                                                                                               | —                               |
| 2026-10-08 | ⏭ 记录                   | 分页 hover 底用 primary 与卡片底 10% 混色（kv3 与 #fff 混），差 ≈7 级；表体常驻滚动条同前                                                                                                                                                                             | —                               |
| 2026-10-08 | 待办                     | `_page-utils` drawer-pick 仍写 `.table-wrap__bd`/`.el-table`（kr 为 `.table-wrap-bd`），随 useDrawerPickListMaxHeight 处理；表格行内图标按钮描边色比 kv3 深                                                                                                           | —                               |
| 2026-10-08 | CC 列宽                  | useFlexColumns 复刻 el-table minWidth 比例分余宽；表体节点重建/尺寸变化重测，5 次刷新稳定                                                                                                                                                                             | 331102a 233cda5 99d908c         |
| 2026-10-08 | CC schema.fixed / 钉列   | `fixed` 仅「不可取消勾选」与 Vue 同义；fixed-cols 独立页（ID/名称钉左、操作钉右）；plain 按钮全局化                                                                                                                                                                   | c97ecfd 27a9f8c 890336b         |
| 2026-10-08 | CC 单元格/表头           | 分组表头 3px、行内按钮 24 高；评分星按小数填充；HOT 标签 el-tag small；Slots 页去无效排序；kv3 renderHeader 改 #header 插槽消告警                                                                                                                                     | cb2bf05 94821e7 113310a         |
| 2026-10-08 | CC 配置 UI               | r-custom-columns 由 720 Modal（上移/下移）重写为与 Vue 包 1:1：悬停配置列表 + 1000px 抽屉（搜索/分组导航联动/勾选/固定区/sortablejs 拖拽/存读本地）；basic/nested/version/slots/fixed-cols 全流程与 kv3 逐步一致；包 React 类型对齐 19，既有 11 个 typecheck 错误清零 | 0a82c72                         |
| 2026-10-08 | CC 抽屉控件              | Checkbox 14px、选中品牌色文字、禁用选中 border-light 底 + placeholder 勾；Drawer 卡片底                                                                                                                                                                               | 72b0f2d                         |
| 2026-10-08 | kv3/kv2 缺陷             | kv3 已选列拖拽松手回弹不生效（computed setter 空实现）；三包分组导航 `--ku-neutral-50` 暗色仍白底                                                                                                                                                                     | 05a7a86                         |
| 2026-10-08 | ⏭ CC 暗色                | kv3 暗色 popover / 默认按钮 / 输入框底为 EP 自带 `--el-bg-color*`（skin 未桥接），kr 走 skin token，不追同值；kv2 无 ROI 条件插槽（kv2 对齐另行处理）                                                                                                                 | —                               |
| 2026-10-08 | 待办                     | `scripts/gen-full-kr-admin*.mjs` 一次性脚手架已过期（重跑会覆盖修复），待用户确认后删除                                                                                                                                                                               | —                               |
