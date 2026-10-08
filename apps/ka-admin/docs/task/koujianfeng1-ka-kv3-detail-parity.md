# koujianfeng1-ka-kv3-detail-parity

状态：✅ 已完成（2026-10-08）

> ka-admin（3444，Angular 22 + ng-zorro 22）对照 kv3 金标（3111）与已打磨完的 kr（3333）：按「共享组件 → 壳层 → 叶子页 → 场景」抠交互与视觉细节；**一个缺陷簇一查一修一提交**。

## 范围

- 金标：`apps/kv3-admin`（3111）；同构参照：`apps/kr-admin`（3333，antd v5）
- 目标：`apps/ka-admin`（3444）
- 验收：Chrome Debug CDP `:9222`，**真实鼠标事件**（`Input.dispatchMouseEvent`）；脚本在 `.playwright-mcp/`（`cdp.mjs`、`ka-shot.mjs`、`ka-*-flow.mjs`、`ccflow.mjs`）
- 截图：`.playwright-mcp/logs/ka/`，kr 对照图 `logs/kr-cmp/`
- 环境：Node `22.23.3`（`nvm use`）；Angular 22 要求 `^22.22.3 || ^24.15.0 || >=26`

## A. 共享组件 / 基础设施

| ID  | 组件                                     | 验收要点                                                 | 状态 |
| --- | ---------------------------------------- | -------------------------------------------------------- | ---- |
| C01 | HeaderProfileMenu + AppearancePicker     | 侧向外观、切肤、瞬时关闭、无 popover 壳                  | ✅   |
| C02 | BrandLogoMark / AdminVersionLogo         | 完整 logo、更新角标                                      | ✅   |
| C03 | DoFilterPanel                            | 折叠 / 按钮槽 / 离散即查 / disableFold / labelWidth auto | ✅   |
| C04 | TableWrap + KuDoTableHeader              | 工具栏、自定义列入口、高度                               | ✅   |
| C05 | ListPaginationBar                        | 总数 / 页码 / 每页 / 跳页                                | ✅   |
| C06 | CellNameId / CellState / CellDateTime    | 开关确认、只读指示器、ISO 时区串                         | ✅   |
| C07 | DoSelector / DoNamePattern / DoWordsTag  | 远程懒加载、插入位、标签增删                             | ✅   |
| C08 | DoNumberSetter / DoTxtSetter / DateRange | 行内编辑、`ok` 回调、日期范围（date-fns 适配器）         | ✅   |
| C09 | DialogPreviewVideo                       | 竖版 444 宽、内距 = kr + 16                              | ✅   |
| C10 | ScheduleTimeWeekPicker                   | 预设 / 拖选 / 汇总                                       | ✅   |
| C11 | injectTableQuery                         | 竞态丢弃旧结果、`setListFilters` 同步、`ngOnInit` reset  | ✅   |
| C12 | injectConfirm / NzMessageService         | 实心警示图标、无关闭叉、居中、Promise loading            | ✅   |
| C13 | injectRowSelector + DoSelectCell         | 单/多选、半选/全选、回显                                 | ✅   |
| C14 | ApiClient 取消请求                       | 被中止请求不弹错误                                       | ✅   |
| C15 | 学校选择器 + 抽屉（CVA）                 | 折叠 tag、悬浮面板、回显、确认不清空、已选计数           | ✅   |
| C16 | a-custom-columns                         | 悬停配置列表 + 1000px 抽屉全流程                         | ✅   |

## B. 壳层

| ID  | 项                           | 验收要点                                             | 状态 |
| --- | ---------------------------- | ---------------------------------------------------- | ---- |
| S01 | BaseHeader                   | Logo / Demo Tab / 账户菜单 / 外观                    | ✅   |
| S02 | DomainModuleShell            | aside 220、主区 padding 20                           | ✅   |
| S03 | SideMenu                     | 展开链、高亮、图标、暗色、四级缩进 / 引导线 / 箭头色 | ✅   |
| S04 | 皮肤（less 生成 + bridge）   | `--ku-*` / dark / 卡片 / Alert / Tag / 面包屑 / 抽屉 | ✅   |
| S05 | 开屏 / 404 / 登出 / 版本提示 | splash 移除、异常页、已退出页、版本角标              | ✅   |

## C. 叶子页场景清单

列表页标准场景 s1–s12 同 kr 台账（首屏 / 文本筛 / 离散即查 / 重置 / 分页 / 批量 / 行内开关 / 新建 / 编辑 / 删除 / 暗色 / 控制台干净）。

| 组       | ID        | 路径                                                                                                   | 状态                                                              |
| -------- | --------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| 示例管理 | L01–L06   | `simple/list`、`simple/batch-select`、`school/list`、`school-selector/demo`、`clazz/list`、`club/list` | ✅ 交互流与 kr 一致；明暗指纹一致                                 |
| 基础组件 | U01–U08   | `ui-kit/*`                                                                                             | ✅ 交互 + 明暗指纹一致                                            |
| 筛选面板 | F01–F09   | `do-filter-panel/*`                                                                                    | ✅ 明暗指纹 + 输入回车 / 下拉 / 单选即查 / 搜索 / 重置 / 导出     |
| 自定义列 | CC01–CC08 | `custom-columns/*`                                                                                     | ✅ 明暗对图 + 抽屉全流程 + 排序 / tooltip / 固定区 / 嵌套 colspan |
| 多级导航 | N01–N04   | `nest-menus/*`                                                                                         | ✅ 明暗指纹 + 面包屑 + 侧栏多级几何与 kv3 逐像素一致              |

全路由验收脚本：`.playwright-mcp/ka-verify.mjs`（41 路由 × 明暗，ka/kr 同路径截图 + 指纹：面包屑 / 按钮 / 字段数 / 表头 / 行数 / 总数 / 空态 / 底色 / 控制台），截图 `logs/ka/verify/`、`logs/kr-cmp/verify/`；侧栏几何 `side-geo.mjs`；筛选交互 `fflow.mjs`（`PORTS=3333,3444`）；开屏 / 登出 `ka-s05-flow.mjs`。CDP 新开标签须 `Page.bringToFront`，否则后台页 rAF 暂停，ng-zorro 下拉宽度停在 2px 造成误报。

## 执行约定

1. **顺序**：L → U → F → CC → N；共享组件缺陷在首个暴露它的叶子里修
2. **提交粒度**：一个缺陷簇一个 commit；台账进度单独 docs commit
3. **通过标准**：与 kr / kv3 同路径对照；场景逐条点通；控制台干净；暗色无残留
4. **跳过**：仅控件皮差异（ng-zorro vs antd）且不影响信息架构 / 交互语义的标 `⏭` 并写理由

## 进度日志

| 日期       | 项                        | 结论                                                                                                                                                                                                             | commit                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 2026-10-08 | 仓库基建                  | Angular 22 tsconfig / eslint 预设、commit scope、根脚本 `dev:admin:angular`                                                                                                                                      | dbc1b48 de9f7e7         |
| 2026-10-08 | hooks-angular             | `injectMaxHeight` / `injectVersionUpdate`（signals + DestroyRef）                                                                                                                                                | 48a71d7                 |
| 2026-10-08 | a-custom-columns          | signals 状态、指令上下文、1000px 抽屉 CDK 拖拽                                                                                                                                                                   | d52df05                 |
| 2026-10-08 | 骨架与外壳                | 路由 / Mock 中间件 / 开屏 / 顶栏 / 侧栏 / 换肤 / 异常页，端口 3444                                                                                                                                               | 588b473                 |
| 2026-10-08 | 公共组件                  | TableWrap / DoFilterPanel / CellState / 分页栏等与 kr 1:1                                                                                                                                                        | 252bf09                 |
| 2026-10-08 | L01 L02                   | 示例管理列表与表外全选                                                                                                                                                                                           | 0a4d00d                 |
| 2026-10-08 | C01 账户菜单              | 去 popover 壳、宽度间距对齐 kr                                                                                                                                                                                   | 9fd3e53                 |
| 2026-10-08 | S04 卡片 / 消息           | 实心图标、卡片底 / 阴影 / 留白                                                                                                                                                                                   | 58b05d3                 |
| 2026-10-08 | S04 抽屉 / body 行高      | body 行高 1.15；抽屉标题 / 页脚 / 关闭按钮 / 分隔线                                                                                                                                                              | 962a93e                 |
| 2026-10-08 | L03 L04                   | 学校列表、选择抽屉、选择器 Demo（CVA，多选折叠悬浮）                                                                                                                                                             | 7ad71d1                 |
| 2026-10-08 | S04 Tag                   | 默认底色卡片底叠加 3%、4px 圆角                                                                                                                                                                                  | fd382f2                 |
| 2026-10-08 | L05 L06                   | 班级 / 社团（学校选择器表单、全选本页、批量启停）                                                                                                                                                                | d7a25b6                 |
| 2026-10-08 | C08 日期                  | `NZ_DATE_LOCALE`（v23 移除）→ `provideNzDateFnsAdapter`；ISO 时区串先 `parseISO`                                                                                                                                 | 31c3ade                 |
| 2026-10-08 | S04 卡片头 / Alert / 预览 | 卡片头 54（small 同值 + flex 居中）、Alert 24 行高、预览弹窗内距 = kr + 16                                                                                                                                       | 0d1bd65                 |
| 2026-10-08 | U01–U08                   | 基础组件 8 页，交互流与 kr 一致                                                                                                                                                                                  | f5f3703                 |
| 2026-10-08 | N 面包屑                  | 分隔符模板空白 → inline-flex；描述色 placeholder；段落用 div                                                                                                                                                     | 8180af5                 |
| 2026-10-08 | F01–F09 N01–N04           | 场景经路由 data 直绑 input                                                                                                                                                                                       | ba45fa0                 |
| 2026-10-08 | C16 抽屉搜索              | a-custom-columns 搜索框缺清空（Vue `clearable` / React `allowClear` 均有）→ `nzAllowClear`                                                                                                                       | 39b20d6                 |
| 2026-10-08 | CC01–CC08                 | 共用 `custom-columns-table`；受控排序；08 详情按钮 `btn-plain-primary`                                                                                                                                           | f0c9301                 |
| 2026-10-08 | ⏭ 表格列偏移              | 表体常驻滚动条致末列约 3px 偏移，ng-zorro / antd 滚动条实现差异                                                                                                                                                  | —                       |
| 2026-10-08 | P7 规则与文档             | 8 rules + 3 skills + 列表页模式 + 台账；parity 改名 `admin-parity` 四生约定、SYNC 登记                                                                                                                           | 8914a70 177f5fc         |
| 2026-10-08 | P8 全路由明暗             | 41 路由 × 明暗指纹 ka = kr；school 总数 13 为 kr 内存 Mock 被前序新建测试改动（种子均 12）                                                                                                                       | —                       |
| 2026-10-08 | S04 body 底色             | ng-zorro reset 给 body 卡片底，kv3 / kr 透明（页面底只在 html）→ `transparent`                                                                                                                                   | 2a81983                 |
| 2026-10-08 | S03 侧栏多级（四生）      | kv3 二级起缩进 22/34/46、引导线 28/40/52、标题宽 −20、箭头距右 26、激活链箭头 / 图标高亮；kr / ka 同补，ka 递归模板查不到子项需显式绑 `ant-menu-submenu-selected`；kv2 子项 `min-width:0` 防溢出、图标盒 18 + 10 | 2a81983 c421ddf 4351701 |
| 2026-10-08 | S05 开屏 / 登出           | splash 移除、404 / 异常页 / 已退出页明暗一致；Mock 无会话，登出 POST 后回首页，与 kv3 / kr 同                                                                                                                    | —                       |
| 2026-10-08 | F01–F09 交互              | 9 场景输入回车 / 下拉 / 单选即查 / 搜索 / 重置 / 导出，`/api/` 请求次数与 kr 一致                                                                                                                                | —                       |
