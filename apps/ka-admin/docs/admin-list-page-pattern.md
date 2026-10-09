# 管理端业务列表页范式（ka-admin · Angular 22 + ng-zorro）

> 样板：`src/modules/_example/simpleExample/`（开发态 Demo）。学校金标：`schoolResource`。自定义列：`customColumns`。筛选面板：`doFilterPanel`。基础组件：`uiKit`。
> 选择器细则：`.cursor/rules/entity-selector.mdc`。四生对照：仓库根 `docs/best-practice/admin-parity/`。

## 1. 目录骨架

```text
src/modules/<域>/<子业务>/
├── _router/          # Routes：loadComponent（default export）+ data satisfies AppRouteData
├── _api/             # XxxApi（providedIn root）唯一请求入口（URL 与 mock /api/... 对齐）
├── _map/             # 子业务枚举 → 由域 _maps 聚合到 maps.<域>
├── _mock/            # MockMethod[] + 硬编码种子
├── _module/          # xxx-list.ts、dialog-xxx.ts（含 nz-drawer，禁 drawer-xxx 文件名）
└── xxx-layer.ts      # 薄壳：host class page-*；dialog 放在根内
```

域级：`modules/<域>/_router`、`_maps`、`_mock`、`index.ts`（`DomainModuleShell` + `menus.ts` 侧栏）。

## 2. 列表页硬约束

| 项           | 约定                                                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 写法         | standalone + OnPush + zoneless + signals；`input()`/`output()`、`inject()`、`@if`/`@for`                                                                             |
| 页面根 class | `host: { class: 'page-<业务>' }`                                                                                                                                     |
| 列表状态     | **`injectTableQuery`**：`filters` / `setListFilters` / `tableData` / `tableLoading` / `tableLoadFailed` / `search` / `reset` / `patchRow`；fetcher `(query, signal)` |
| 依赖输入     | 构造期读不到 `input()`：`immediate: false` + `ngOnInit` 里 `query.reset(filters, pageSize)`                                                                          |
| 表格容器     | `<ka-table-wrap>`；插槽 `[tableBatch]` / `[tableControl]` / `[tableHeader]` / `[tableFooter]`                                                                        |
| 表格 class   | `do-inner-scroller page-table`；`nzSize="middle"`                                                                                                                    |
| 高度         | `injectAdminTableMaxHeight('.page-xxx', 400)` → `[nzScroll]="{ y: maxHeight() + 'px' }"`；禁写死 px                                                                  |
| 列宽         | `injectFlexColumns(COLUMNS, '.page-xxx')` → `[nzWidthConfig]`（与 el-table `minWidth` 同算法分余宽）                                                                 |
| 加载         | `[nzLoading]="query.tableLoading()"` 绑在 `nz-table`，禁止绑 TableWrap                                                                                               |
| 失败出口     | 表体按 `tableLoadFailed()` 失败态 + 重试；选择器态 `onError` → `loadFailed.emit()`                                                                                   |
| 筛选         | `ka-do-filter-panel`；placeholder「不限」；顺序：日期 → 文本 → 其它非 radio → radio；单选 ≤3 用 `nz-radio-button`；分组筛选用 `disableFold`                          |
| 筛选即查     | 离散完成立刻 `setListFilters(...)` 再 `search(true)`；关键字打字不查（回车查）；禁 `effect` 监听 filters                                                             |
| 分页         | `ka-list-pagination-bar`（`pageChange` / `sizeChange` → `handlePageChange` / `handleSizeChange`）                                                                    |
| 页头         | **禁止**挂 PageHeader / 页级 title / subtitle                                                                                                                        |
| 日期范围     | `ka-date-range`；禁止裸 `nz-range-picker`                                                                                                                            |
| 弹层         | `dialog-xxx.ts`；父级 `[open]` + `(closed)` / `(success)`；表单用 Reactive Forms + `nzErrorTip` 中文文案                                                             |
| 确认         | `injectConfirm()`（`@/plugins/confirm`）；`onOk` 返回 Promise 时确定按钮自动 loading                                                                                 |
| 操作列       | 行内 `btn-plain-*` + `nzSize="small"`；表头「新建」；批量 → `[tableBatch]`                                                                                           |
| 启停         | `ka-cell-state`；页面态 `[switchable]="true"`，翻转后 `patchRow` 原地更新                                                                                            |
| 名称+ID      | `ka-cell-name-id`                                                                                                                                                    |
| 多选全选     | 优先表头选择列（`ka-do-select-cell`）；表外全选用 `.batch-select-control`（`/example/simple/batch-select`）                                                          |
| 自定义列     | `@ku-utils/a-custom-columns`：`createSchemaColumnConfig` + `[kuSchemaColumnConfig]`                                                                                  |

## 3. 选择器

跨域选实体一律 `xxx-selector`（CVA）+ `dialog-select-xxx` + List 双模。金标：`schoolResource`。禁止手填 ID / remote `nz-select` 截断首屏。详见 `entity-selector.mdc`。

## 4. 筛选面板 Demo

路径前缀 `/example/do-filter-panel/`：

| path                                       | 说明                                     |
| ------------------------------------------ | ---------------------------------------- |
| `buttons-1` … `buttons-4`                  | 控制区按钮 1–4 个                        |
| `rows-1` / `rows-2` / `rows-3` / `rows-50` | 筛选项规模                               |
| `layout-fold`                              | `fillViewportLayout`，验收展开筛选压表格 |

场景经路由 `data.doFilterPanel` → `withComponentInputBinding` 直绑页面 `input()`。增删场景见 `.cursor/skills/filter-panel-demo/SKILL.md`。

## 5. 基础组件 Demo（ui-kit）

| path              | 组件                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------- |
| `panel` / `cells` | 筛选表格分页 / 单元格编辑器（`ka-do-number-setter` / `ka-do-txt-setter` 用 `ok` 回调） |
| `max-height`      | `injectAdminTableMaxHeight` + 横向滚动钉列                                             |
| `name-pattern`    | `ka-do-name-pattern`                                                                   |
| `selector`        | `ka-do-selector`（静态枚举；分页实体用 `ka-school-selector`）                          |
| `words-tag`       | `ka-do-words-tag`                                                                      |
| `preview-video`   | `ka-dialog-preview-video`                                                              |
| `schedule-week`   | `ka-schedule-time-week-picker` + `utils/schedule-time`                                 |

## 6. ng-zorro 与 antd v5 差异（对齐 kr 时的固定换算）

| 项         | 换算                                                                                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Modal 内距 | ng-zorro modal 无 content 级 padding；kr `bodyStyle` 外还有 antd v5 的 16px，ka 取 kr 值 + 16px                                                                                                                     |
| Typography | antd v5 `Paragraph` 渲染 `div`；ka 用 `<div nz-typography>` 才有 1em 下边距                                                                                                                                         |
| 主题       | less 编译 ng-zorro 源样式（`scripts/generate-zorro-theme.mjs`：`MODIFY_VARS` / `KEEP_LITERAL_SELECTOR` / `SELECTOR_OVERRIDES`），less 表达不了的进 `zorro-ku-bridge.scss`（卡片头、Alert 行高、Tag 底色、面包屑等） |
| 日期       | `provideNzDateFnsAdapter`；字符串时间先 `parseISO`，失败再按 `-`→`/` 兜底                                                                                                                                           |
| 按钮配色   | 无 color/variant 组合，`el-button plain` / kr `variant="outlined"` 一律 `btn-plain-primary                                                                                                                          | success | warning` |
| 表格测试   | `nzScroll` 时首个 `tr` 是隐藏测量行，第 N 行是 `tr.ant-table-row:nth-child(N+1)`                                                                                                                                    |
| 抽屉       | 判断打开用 `.ant-drawer-open`（关闭后 DOM 仍在）                                                                                                                                                                    |

## 7. Example 门控

`environment.useExample=true` 仅开发；生产 `ng build` 用 `fileReplacements` 把 `_example` 路由 / maps / 顶栏 Tab 换成 `src/stubs/*`，esbuild 插件 `forbid-example-in-bundle` 禁止打进产物。

## 8. 合同信封（本仓）

`{ code, message, data }`；成功仅 `code === 0`。分页字段：`lists` + `total` + `pageNum` / `pageSize`。ID 在学校等分页实体选择器金标为 **string**。

## 后续 starter

可将本 `apps/ka-admin` 目录拷到新仓库，把 `workspace:*` 换成 npm 上的 `@ku-utils/*` 版本，并去掉 `prebundle.exclude`。
