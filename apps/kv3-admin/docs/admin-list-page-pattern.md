# 管理端业务列表页范式

> 样板：`src/modules/_example/simpleExample/`（开发态 Demo）。自定义列样板：`src/modules/_example/customColumns/`。筛选面板：`src/modules/_example/doFilterPanel/`。基础组件：`src/modules/_example/uiKit/`。

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

- 页面根 class：`page-<业务>`（唯一顶级节点）
- 表格容器：`<TableWrap>`（Dialog 内嵌表可省）
- 表格 class：`do-inner-scroller page-table hide-table-border`
- 表格属性：`border` + `stripe` + `:max-height="maxHeight"`
- 高度：父页 `useAdminTableMaxHeight('.page-xxx')`，经 prop 传入独立 `XxxList`
- 抽屉内表：`useDrawerPickListMaxHeight`；`@opened` 调 `remeasureAfterLayout()`；禁止写死 px
- 加载：`v-loading="tableLoading"` 绑在 `el-table`，禁止绑 TableWrap
- 筛选：`DoFilterPanel`；placeholder「不限」；单选且选项 ≤3 用 `el-radio-button`；日期在前、radio 在后；分组筛选用 `disableFold`
- 日期范围：`DateRange`，禁止裸 `el-date-picker` 做范围
- 弹层：`DialogXxx.vue`；关闭时若清空主键，禁止再自动 search
- 自定义列：`@ku-utils/custom-columns` + `useSchemaColumnConfig`

## 3. 选择器

跨域选实体一律 `XxxSelector.vue` + 独立 Demo 页。禁止用手填 ID / 裸 `el-select` 代替。

## 4. 筛选面板 Demo

路径前缀 `/example/do-filter-panel/`：

| path                                       | 说明                                     |
| ------------------------------------------ | ---------------------------------------- |
| `buttons-1` … `buttons-4`                  | 控制区按钮 1–4 个                        |
| `rows-1` / `rows-2` / `rows-3` / `rows-50` | 筛选项规模                               |
| `layout-fold`                              | `fillViewportLayout`，验收展开筛选压表格 |

增删场景见 `.cursor/skills/filter-panel-demo/SKILL.md`。

## 5. 基础组件 Demo（ui-kit）

| path              | 组件                                            |
| ----------------- | ----------------------------------------------- |
| `panel` / `cells` | 筛选表格分页 / 单元格编辑器                     |
| `max-height`      | `useAdminTableMaxHeight`                        |
| `name-pattern`    | `DoNamePattern`                                 |
| `selector`        | `DoSelector`                                    |
| `words-tag`       | `DoWordsTag`                                    |
| `preview-video`   | `openPreviewVideo`                              |
| `schedule-week`   | `ScheduleTimeWeekPicker` + `utils/scheduleTime` |

## 6. Example 门控

`VITE_APP_USE_EXAMPLE=1` 仅开发；拷到业务仓后生产设为 `0`，Vite 插件 `forbid-example-in-bundle` 禁止打进产物。

## 7. 合同信封

`{ code, message, data }`；成功仅 `code === 0`。

## 后续 starter

可将本 `apps/kv3-admin` 目录拷到新仓库，把 `workspace:*` 换成 npm 上的 `@ku-utils/*` 版本。`create-ku-utils-app` 完整拷贝本模板不在本期。
