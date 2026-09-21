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

| 变量                                                                      | 说明                                                           |
| ------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `--ku-bg-page-from` / `-to` / `--ku-bg-page` / `-gradient`                | 页面底色（渐变起止 + 兜底纯色 + 渐变简写）                     |
| `--ku-bg-card` / `-card-elevated`                                         | 卡片底色 / 悬浮态卡片底色                                      |
| `--ku-bg-sidebar` / `-sidebar-active` / `-sidebar-hover`                  | 侧栏底色及选中/hover。只给侧栏，不要拿去当按钮或表格的中性填充 |
| `--ku-table-stripe-bg` / `--ku-table-header-bg`                           | 表格斑马纹 / 表头。同时桥接 `--el-fill-color*`，不能改用侧栏色 |
| `--ku-bg-input` / `-hover` / `-active` / `-tag` / `-overlay` / `-tooltip` | 输入框 / 通用 hover-active 底色 / Tag 底色 / 遮罩 / Tooltip    |

### 顶栏（跟随皮肤，Light / Dark 各自声明，应用不要写死底色）

| 变量                                                                                            | 说明                       |
| ----------------------------------------------------------------------------------------------- | -------------------------- |
| `--ku-top-header-bg` / `-text` / `-text-muted`                                                  | 顶栏底色 / 文字 / 弱化文字 |
| `--ku-top-header-hover-bg` / `-hover-border`                                                    | 悬浮态                     |
| `--ku-top-header-active-bg` / `-active-border` / `-active-indicator` / `-active-indicator-size` | 选中态                     |
| `--ku-top-header-expanded-bg` / `-expanded-border` / `-expanded-text`                           | 展开态                     |
| `--ku-top-header-selection-bg` / `-selection-text`                                              | 顶栏内选中态               |

### 文字 / 边框

| 变量                                                                | 说明                                                           |
| ------------------------------------------------------------------- | -------------------------------------------------------------- |
| `--ku-text-primary` / `-secondary` / `-disabled` / `-placeholder`   | 正文层级                                                       |
| `--ku-text-link` / `-link-hover` / `-inverse`                       | 链接 / 深色底上的反色文字                                      |
| `--ku-text-on-sidebar` / `-on-sidebar-muted` / `-on-sidebar-active` | 侧栏默认 / 次级 / 选中底上的文字（选中底较实的皮肤必须单独给） |
| `--ku-text-on-primary`                                              | 实心主色按钮、选中 radio、当前页码上的文字                     |
| `--ku-border-default` / `-hover` / `-focus` / `-light`              | 边框四态                                                       |
| `--ku-divider`                                                      | 分割线                                                         |

### 其它品牌层

| 变量                                                                        | 说明                                                                                      |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `--ku-chart-ring-1` … `-4` / `--ku-chart-ring-track`                        | 图表环形色                                                                                |
| `--ku-scrollbar-width` / `-track` / `-thumb` / `-thumb-hover`               | 滚动条                                                                                    |
| `--ku-selection-bg` / `-text`                                               | 文本选中态                                                                                |
| `--ku-shadow-card` / `-card-hover` / `-nav-active` / `-modal` / `-dropdown` | 品牌阴影                                                                                  |
| `--ku-loading-bg`                                                           | Loading 遮罩底色（明暗不同）                                                              |
| `--ku-font-family-base` / `-mono`                                           | 正文字体 / 等宽。真源在 `base-tokens.js`（系统 UI 无衬线），皮肤勿覆盖成未托管的宋体/衬线 |
| `--ku-layout-aside-width`                                                   | 侧栏宽度                                                                                  |

## 包内用法（必须带 fallback）

`packages/ui`、`ui-vue2`、`directives`、`custom-columns`、`v2-custom-columns` 等库代码**只读** `--ku-*`，不把皮肤 CSS 打进自己的产物（换哪一套皮肤由应用 `import '@ku-utils/skin'` / `@ku-utils/skin/<name>` 决定）。

每一处消费必须写成 `var(--ku-xxx, <lark 浅色 fallback>)`，fallback 取本包默认皮肤 `lark` 的 Light 值（base 层 token 取 `src/base-tokens.js`）。这样：

- 应用引入了 skin：用当前皮肤（含 `html.dark`）
- 应用没引入 skin：组件仍按 lark 浅色显示，不会掉成浏览器初始值

组件私有运行时变量（`--ku-liquid-*`）由组件自己赋值，不需要皮肤 fallback。

## 明确不在契约内

- `packages/ui` 组件内联样式绑定的 `--ku-liquid-glass-*`、`--ku-liquid-floating-bar-*`：组件私有、运行时由 props 计算，不是皮肤契约。
- `apps/kv3-admin` 业务代码已全量直连 `--ku-*`，不保留旧无前缀变量（`--primary-color`、`--bg-page` 等）的别名/桥接层。
- 包默认导出仍是 `lark`。`kv3-admin` 默认 `@ku-utils/skin/tome`（典籍风）。`breeze` / `dusk` / `ember` / `glen` / `hextech` / `honey` / `indigo` / `iris` / `orchid` / `sky` 尚未在应用启用。启用改一行 import；新增皮肤需写入 `THEME_FILES` 并 `pnpm --filter @ku-utils/skin build`。

## 变更记录

- `0.1.0`：首个版本，从 jx-dsp Lark 皮肤抽取，覆盖 `packages/ui` / `ui-vue2` / `directives` 当前用到的全部 token + Element Plus 桥接。
- 未发版变更：把 `apps/kv3-admin` 本地保留的 10 套备选皮肤草稿迁移为 `themes/*.js`；`packages/ui` / `ui-vue2` / `directives` / `custom-columns` / `v2-custom-columns` 全面消费 `--ku-*` 且必须带 lark 浅色 fallback。发版时随 changeset 一并升版。
