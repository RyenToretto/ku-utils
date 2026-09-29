# kv2-admin ↔ kv3-admin 双生约定

> **强制**：管理端能力变更必须成对落地，禁止只改一侧。

## 应用对照

|                | kv3-admin                  | kv2-admin                                        |
| -------------- | -------------------------- | ------------------------------------------------ |
| 路径           | `apps/kv3-admin`           | `apps/kv2-admin`                                 |
| Vue            | 3.5 + plugin-vue           | **2.7** + plugin-vue2                            |
| UI             | Element Plus               | Element UI                                       |
| 路由           | vue-router@4               | vue-router@3                                     |
| 状态           | Pinia 3                    | Pinia **2.0.x**（Vue2 兼容）                     |
| 自定义列       | `@ku-utils/custom-columns` | `@ku-utils/v2-custom-columns`（mixin）           |
| 高度/版本 hook | `@ku-utils/hooks`          | 仓内 `src/lib/useMaxHeight` / `useVersionUpdate` |
| 开发端口       | 5173                       | **5174**                                         |
| 脚本           | `pnpm dev:admin`           | `pnpm dev:admin:v2`                              |

## 视觉 / 皮肤对齐（强制）

- **唯一金标** `@ku-utils/skin`（tome）；禁止 apps 自造第二套色板。
- kv3：Element Plus 原生消费 `--el-*`（skin 已桥接）；`el-config-provider` **不设全局 size**。
- kv2：Element UI chalk 写死 `#409EFF` / 圆角 3px / 危险色 `#F56C6C`，必须在 chalk **之后**加载 `src/assets/styles/modules/element-ui-bridge.scss`，把主色 / 危险色 / 圆角 / 表头 / 分页等绑回 `--el-*` / `--ku-*`；`Vue.use(ElementUI)` **同样不设全局 size**（筛选主按钮与 radio 用默认尺寸，表格操作等显式 `size="small"`）。
- **DOM class 差异**（禁止照搬 EP 选择器）：

| Element Plus                                     | Element UI                                                       |
| ------------------------------------------------ | ---------------------------------------------------------------- |
| `.el-sub-menu` / `__title`                       | `.el-submenu` / `__title`                                        |
| `.el-radio-button__original-radio`               | `.el-radio-button__orig-radio`                                   |
| `.el-pager li.is-active`                         | `.el-pager li.active`（bridge / elPagination 双写）              |
| Dialog/Drawer `v-model` / `v-model:visible`      | `:visible.sync`                                                  |
| Popover `v-model:visible`                        | `v-model`（EU `value`）                                          |
| 自定义组件 `v-model`（`modelValue`）             | `value` + `input`（禁双轨 modelValue shim）                      |
| DatePicker `shortcuts` / `disabled-date`         | `picker-options`；格式 token `yyyy`（非 `YYYY`）                 |
| 禁止在组件 props 声明 `class`/`style`            | 单根节点由 Vue2 自动合并                                         |
| `defineProps` 勿写 `\| null` / `default: null`   | Vue2.7 会编成 `type: null` 刷 Invalid prop type                  |
| 跨文件 type alias / `HTMLElement` 勿直接进 props | 同文件内联类型；`HTMLElement` 仅允许运行时 props + eslint 例外   |
| Pinia：`ensure-vue-demi-vue27` 锁 vue-demi 2.7   | 默认 isVue3 会使 Options Store state 以 Ref 暴露 + `toRefs` 警告 |
| 勿 `Vue.component('Filter'/'Menu')`              | 与 HTML/SVG 保留标签冲突；改 import 使用                         |
| **禁止**页级 `PageHeader` / title / subtitle     | 两侧一致；非产品明确拍板不得加回                                 |

## 必须成对的资产

1. `src/modules/_example/**` 各 Example（路径与侧栏一致）
2. `src/components/**`、`src/composables/**`（语义同形；实现可因栈差异）
3. `apps/*/docs/admin-list-page-pattern.md`
4. `apps/*/.cursor/rules/**`、`skills/**`
5. Mock 信封与路由 path

## Agent / 开发流程

1. 改列表/选择器/Mock/自定义列时：**同时打开**两侧 `project-context.mdc`
2. 新增 Example：先更新本清单与两侧 menus，再实现
3. 禁止兼容桥接糊弄 API 差异；按各栈金标改到位
4. 验收：两侧关键路径用 Chrome Debug + Playwright 点通后再合入

## PARITY 模块清单（一期）

- [x] schoolResource + SchoolSelector Demo
- [x] clazzManage / clubActivity
- [x] simpleExample（含 batch-select）
- [x] nestMenus
- [x] uiKit 全路径
- [x] doFilterPanel 场景
- [x] customColumns 01–08（Vue2 为 mixin 形态）
- [x] rules / skills / admin-list-page-pattern
