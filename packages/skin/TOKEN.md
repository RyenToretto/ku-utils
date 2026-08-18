# `@ku-utils/skin` Token 契约

本文件是 `--ku-*` 变量的公开契约表。**新增 token 走 minor，改名/删除走 major**——业务方（`packages/ui`、`ui-vue2`、`kv3-admin`……）都是直接消费这些变量名，改名等价于破坏性变更。

- 「层」= `base`（`src/base-tokens.js` + `src/el-base.css`，所有皮肤共用，不随明暗/品牌变化）或 `theme`（`src/themes/*.js`，随皮肤和 `html.dark` 变化）。
- 颜色类 token 只有 `theme` 层会变；`base` 层的间距/圆角/字号/阴影/层级/中性灰阶所有皮肤、明暗模式都一致。
- Element Plus 的 `--el-*` 不在本表重复列出：结构类（背景/文字/边框/表格/菜单……）全部是 `var(--ku-*)` 的直接转发，颜色阶（`--el-color-{primary,success,warning,danger,error,info}-{light-1..9,dark-2,rgb}`)由 `scripts/generate.mjs` 用 `mix()` 从对应 `--ku-color-*` 基色现算，不是独立契约。

## base 层（`--ku-*`，所有皮肤共用）

| 变量                                                                  | 说明                                                     |
| --------------------------------------------------------------------- | -------------------------------------------------------- |
| `--ku-neutral-50` … `--ku-neutral-900`                                | 中性灰阶，10 档，供组件默认态直接用（不随皮肤/明暗变化） |
| `--ku-space-1` `-2` `-3` `-4` `-5` `-6` `-8`                          | 间距                                                     |
| `--ku-radius-sm` `-base` `-md` `-lg` `-xl` `-full`                    | 圆角                                                     |
| `--ku-font-size-xs` `-sm` `-base` `-lg` `-xl` `-2xl`                  | 字号                                                     |
| `--ku-font-weight-medium` `-semibold`                                 | 字重                                                     |
| `--ku-shadow-sm` `-base` `-md` `-lg` `-xl`                            | 组件通用阴影（区别于品牌层的 `--ku-shadow-card` 等）     |
| `--ku-transition-fast` `-base` `-slow`                                | 过渡时长/曲线                                            |
| `--ku-z-dropdown` `-sticky` `-overlay` `-modal` `-popover` `-tooltip` | 层级                                                     |

## theme 层（`--ku-*`，随皮肤 + `html.dark` 变化）

### 主色

| 变量                                               | 说明                                         |
| -------------------------------------------------- | -------------------------------------------- |
| `--ku-primary-50` … `--ku-primary-950`（11 档）    | 主色色阶原子层，供图表/自定义场景取色        |
| `--ku-color-primary` / `-hover` / `-light` / `-bg` | 主色语义层：默认 / hover / 浅色描边 / 极浅底 |

### 状态色（success / warning / danger / info）

| 变量                                          | 说明                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------ |
| `--ku-color-{success,warning,danger,info}`    | 状态色基色                                                               |
| `--ku-color-{success,warning,danger,info}-bg` | 状态色浅底（Tag / 提示条背景）                                           |
| `--ku-color-{success,warning,danger}-border`  | 状态色浅描边（`info` 同样有 `-border`）                                  |
| `--ku-{success,warning,danger}-600`           | 状态色 hover/深一档（按钮 hover、Tag 文字），由 `mix()` 现算，不是手写值 |

### 背景 / 表面

| 变量                                                                      | 说明                                                        |
| ------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `--ku-bg-page-from` / `-to` / `--ku-bg-page` / `-gradient`                | 页面底色（渐变起止 + 兜底纯色 + 渐变简写）                  |
| `--ku-bg-card` / `-card-elevated`                                         | 卡片底色 / 悬浮态卡片底色                                   |
| `--ku-bg-sidebar` / `-sidebar-active` / `-sidebar-hover`                  | 侧栏底色及选中/hover                                        |
| `--ku-table-stripe-bg` / `--ku-table-header-bg`                           | 表格斑马纹 / 表头底色                                       |
| `--ku-bg-input` / `-hover` / `-active` / `-tag` / `-overlay` / `-tooltip` | 输入框 / 通用 hover-active 底色 / Tag 底色 / 遮罩 / Tooltip |

### 顶栏（壳层专用，业务壳可覆盖）

| 变量                                                                                            | 说明                       |
| ----------------------------------------------------------------------------------------------- | -------------------------- |
| `--ku-top-header-bg` / `-text` / `-text-muted`                                                  | 顶栏底色 / 文字 / 弱化文字 |
| `--ku-top-header-hover-bg` / `-hover-border`                                                    | 悬浮态                     |
| `--ku-top-header-active-bg` / `-active-border` / `-active-indicator` / `-active-indicator-size` | 选中态                     |
| `--ku-top-header-expanded-bg` / `-expanded-border` / `-expanded-text`                           | 展开态                     |
| `--ku-top-header-selection-bg` / `-selection-text`                                              | 顶栏内选中态               |

### 文字 / 边框

| 变量                                                              | 说明                                                   |
| ----------------------------------------------------------------- | ------------------------------------------------------ |
| `--ku-text-primary` / `-secondary` / `-disabled` / `-placeholder` | 正文层级                                               |
| `--ku-text-link` / `-link-hover` / `-inverse`                     | 链接 / 深色底上的反色文字                              |
| `--ku-text-on-sidebar` / `-on-sidebar-muted`                      | 侧栏专用文字（侧栏底色特殊时可与 `text-primary` 不同） |
| `--ku-border-default` / `-hover` / `-focus` / `-light`            | 边框四态                                               |
| `--ku-divider`                                                    | 分割线                                                 |

### 其它品牌层

| 变量                                                                        | 说明                         |
| --------------------------------------------------------------------------- | ---------------------------- |
| `--ku-chart-ring-1` … `-4` / `--ku-chart-ring-track`                        | 图表环形色                   |
| `--ku-scrollbar-width` / `-track` / `-thumb` / `-thumb-hover`               | 滚动条                       |
| `--ku-selection-bg` / `-text`                                               | 文本选中态                   |
| `--ku-shadow-card` / `-card-hover` / `-nav-active` / `-modal` / `-dropdown` | 品牌阴影                     |
| `--ku-loading-bg`                                                           | Loading 遮罩底色（明暗不同） |
| `--ku-font-family-base` / `-mono`                                           | 字体栈                       |
| `--ku-layout-aside-width`                                                   | 侧栏宽度                     |

## 明确不在契约内

- `packages/ui` 组件内联样式绑定的 `--ku-liquid-glass-*`、`--ku-liquid-floating-bar-*`：组件私有、运行时由 props 计算，不是皮肤契约。
- `apps/kv3-admin` 业务代码已全量直连 `--ku-*`，不保留旧无前缀变量（`--primary-color`、`--bg-page` 等）的别名/桥接层。
- 默认在用的只有 `lark`；`breeze` / `dusk` / `ember` / `glen` / `hextech` / `honey` / `indigo` / `iris` / `orchid` / `sky` 是已迁移好数据、但还没有应用启用的备选皮肤（`themes/*.js`），启用只需改一行 import，不需要改 `generate.mjs`。

## 变更记录

- `0.1.0`：首个版本，从 jx-dsp Lark 皮肤抽取，覆盖 `packages/ui` / `ui-vue2` / `directives` 当前用到的全部 token + Element Plus 桥接。
- 未发版变更：把 `apps/kv3-admin` 本地保留的 10 套备选皮肤草稿（`theme-juxiao-*.scss`）迁移为 `themes/*.js` 数据 + 对应子路径导出；`apps/*` 不再保留任何本地皮肤/色板文件，统一由本包提供。发版时随 changeset 一并升版。
