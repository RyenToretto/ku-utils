# 管理端业务列表页范式

> 样板：`src/modules/_example/simpleExample/`（开发态 Demo）。学校金标：`schoolResource`。自定义列：`customColumns`。筛选面板：`doFilterPanel`。基础组件：`uiKit`。  
> 选择器细则：`.cursor/rules/entity-selector.mdc`。

## 1. 目录骨架

```text
src/modules/<域>/<子业务>/
├── _router/          # 叶子路由（component → *Layer.vue）
├── _api/             # 页面唯一请求入口（URL 与 mock 完整 /api/... 对齐）
├── _map/             # 子业务枚举 → 由域 _maps 聚合到 $MAPS.<域>
├── _mock/            # MockMethod[] + 硬编码种子
├── _module/          # XxxList.vue、DialogXxx.vue（含 el-drawer，禁止 DrawerXxx 文件名）
└── XxxLayer.vue      # 薄壳：单根；Dialog 放在根内
```

域级：`modules/<域>/_router`、`_maps`、`_mock`、`index.vue`（`DomainModuleShell` + 侧栏 menus）。

## 2. 列表页硬约束

| 项           | 约定                                                                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 页面根 class | `page-<业务>`（唯一顶级节点）                                                                                                                                             |
| 列表状态     | **`useTableQuery`**：`listFilters` / `tableData` / `tableLoading` / `tableLoadFailed` / `search` / `reset` / `refresh`；fetcher `(query, signal, ctx)`；`AbortController` |
| 表格容器     | `<TableWrap>`（Dialog 内嵌表可省）                                                                                                                                        |
| 表格 class   | `do-inner-scroller page-table hide-table-border`                                                                                                                          |
| 表格属性     | `border` + `stripe` + `:max-height="maxHeight"`                                                                                                                           |
| 高度         | `useAdminTableMaxHeight('.page-xxx')`；抽屉内 `useDrawerPickListMaxHeight`；`@opened` → `remeasureAfterLayout()`；禁写死 px                                               |
| 加载         | `v-loading="tableLoading"` 绑在 `ant-table`，禁止绑 TableWrap                                                                                                             |
| 失败出口     | `#empty` 按 `tableLoadFailed` 失败态 + 重试；选择器态 `onError` → `emit('load-failed')`                                                                                   |
| 筛选         | `DoFilterPanel`；placeholder「不限」；顺序：日期 → 文本 → 其它非 radio → radio；单选 ≤3 用 `el-radio-button`；分组筛选用 `disableFold`                                    |
| 筛选即查     | 离散完成立刻 `search(true)`；关键字打字不查；禁 `watch(listFilters)`                                                                                                      |
| 刷新         | 有分页 → `BasePagination` `enable-refresh` + `@refresh`（留当前页）；`search(true)` ≠ `refresh()`                                                                         |
| 轮询         | `refresh({ silent: true })`；fetcher 把 `ctx.silent` 传给 request；用户主动操作禁止静默                                                                                   |
| 页头         | **禁止**挂 `PageHeader` / 页级 title / subtitle（**非产品明确拍板**不得加回；顶栏+侧栏已表达身份）                                                                        |
| 日期范围     | `DateRange`；禁止裸 `el-date-picker` 做范围                                                                                                                               |
| 弹层         | `DialogXxx.vue`；关闭清空主键时勿再自动 search                                                                                                                            |
| 操作列       | 行内 `plain` + `size="small"`；禁 `link`；表头「新建」；批量 → `#batch`                                                                                                   |
| 启停         | `CellState`；选择器内 `:switchable="false"`                                                                                                                               |
| 名称+ID      | `CellNameId`（`class-name="name-slot-cell"`）                                                                                                                             |
| 多选全选     | 优先表头选择列；表外全选用 `.batch-select-control`（`/example/simple/batch-select`）                                                                                      |
| 自定义列     | `@ku-utils/custom-columns` + `useSchemaColumnConfig`                                                                                                                      |

## 3. 选择器

跨域选实体一律 `XxxSelector` + `DialogSelectXxx` + List 双模。金标：`schoolResource`。禁止手填 ID / remote `el-select` 截断首屏。详见 `entity-selector.mdc`。

## 4. 筛选面板 Demo

路径前缀 `/example/do-filter-panel/`：

| path                                       | 说明                                     |
| ------------------------------------------ | ---------------------------------------- |
| `buttons-1` … `buttons-4`                  | 控制区按钮 1–4 个                        |
| `rows-1` / `rows-2` / `rows-3` / `rows-50` | 筛选项规模                               |
| `layout-fold`                              | `fillViewportLayout`，验收展开筛选压表格 |

增删场景见 `.cursor/skills/filter-panel-demo/SKILL.md`。

## 5. 基础组件 Demo（ui-kit）

| path              | 组件                                                  |
| ----------------- | ----------------------------------------------------- |
| `panel` / `cells` | 筛选表格分页 / 单元格编辑器                           |
| `max-height`      | `useAdminTableMaxHeight`                              |
| `name-pattern`    | `DoNamePattern`                                       |
| `selector`        | `DoSelector`（静态枚举；分页实体用 `SchoolSelector`） |
| `words-tag`       | `DoWordsTag`                                          |
| `preview-video`   | `openPreviewVideo`                                    |
| `schedule-week`   | `ScheduleTimeWeekPicker` + `utils/scheduleTime`       |

## 6. Example 门控

`VITE_APP_USE_EXAMPLE=1` 仅开发；拷到业务仓后生产设为 `0`，Vite 插件 `forbid-example-in-bundle` 禁止打进产物。

## 7. 合同信封（本仓）

`{ code, message, data }`；成功仅 `code === 0`。分页字段：`lists` + `total` + `pageNum` / `pageSize`。ID 在学校等分页实体选择器金标为 **string**。

> 不引入他仓 `adaptCreativePageToTableQuery`；`useTableQuery` 直接吃本仓 axios 解包后的 page 形态。

## 后续 starter

可将本 `apps/kr-admin` 目录拷到新仓库，把 `workspace:*` 换成 npm 上的 `@ku-utils/*` 版本。
