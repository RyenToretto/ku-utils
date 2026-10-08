---
name: theme-skin
description: >-
  @ku-utils/skin 统一皮肤与 Design Token。新增/修改 token、换肤、v-loading 遮罩色、
  Element Plus --el-* 桥接、antd 主题接入（skin/tokens）、packages 内 var(--ku-*, fallback) 写法时使用。
---

# Theme Skin（@ku-utils/skin）

真源：`packages/skin` + [`TOKEN.md`](../../../packages/skin/TOKEN.md)。  
契约：**新增 token → minor；改名/删除 → major**。

## 核心原则

1. **唯一语义前缀** `--ku-*`；apps **不自建**第二套色板文件。
2. **packages 内必须带 fallback**：`var(--ku-xxx, <tome 浅色值>)`，不把 skin CSS 打进组件库产物。
3. **唯一金标皮肤 `tome`**：应用入口 `import '@ku-utils/skin'`（= tome）；不维护多套备选皮肤，不搞运行时多皮肤切换。
4. 明暗只认 `html.dark`（禁止 `data-theme` / 页面自造暗色选择器当主方案）。
5. **JS 主题系统（antd）**吃 `@ku-utils/skin/tokens` 的已解析色值（`tome.light` / `tome.dark`），不写 `var(--ku-*)`（无法派生色阶），也不在 apps 手抄 hex；暗色算法会改写种子色，品牌/状态色需按皮肤值钉回（见 kr-admin `plugins/antdTheme.ts`）。
6. **状态色色阶**读 `--ku-color-{family}-light-1..9` / `-dark-2` / `-rgb`（明暗各一套，算法同 Element Plus）；非 Element 栈要与 kv3 同值时用它，禁止读 `--el-*` 或自己 `color-mix` 近似。
7. **引入顺序**：`--el-*` 转发在 `:root, html.dark` 共享块，与 Element Plus `dark/css-vars.css` 同优先级，skin 必须在它之后引入，否则暗色被 Element Plus 灰色系压过。
8. **编译期写死色值的组件库**（Element UI chalk、ng-zorro less）用**构建期生成器**整体换皮，不手写「换色覆写层」：按「属性语境 + 字面量」映射到中性色表与状态色阶（目标是 Element Plus **组件内实际生效值**：EP 在组件选择器上重新声明 `--el-input-bg-color` 等组件级变量，默认指回通用中性色，skin 在 `:root` 的同名组件变量对 EP 不生效，非 Element Plus 栈不要去读）；弹层 / 对话框 / 抽屉阴影整值映射到 `--el-box-shadow*`（明暗各一套）；**映射不到的字面量必须让生成失败**，确需保留（预设色板、细阴影、取色器、恒白开关钮等）显式登记。生成产物 gitignore，`predev` / `prebuild` 生成，且不得再引入原始主题 CSS。
9. **验收要过悬停与弹层**：静态页面看不出漏色，四端明暗都要实测表格行 / radio / 菜单 / 分页悬停、头像菜单、下拉、日期面板、对话框、确认框；屏幕上出现蓝 / 紫色相或暗色下大块浅底即为漏色（tome 无蓝紫色相）。

## mask ≠ overlay（强制）

| 变量                               | 用途                  | token                      |
| ---------------------------------- | --------------------- | -------------------------- |
| `--el-mask-color`                  | 表格/区域 `v-loading` | **浅色** `--ku-loading-bg` |
| `--el-overlay-color`（及弹层遮罩） | Dialog/Drawer 遮罩    | **深色** `--ku-bg-overlay` |

禁止把 loading mask 指到深色 overlay（会出大黑罩）。

`--el-fill-color` / `-light` 是内容区中性底（表格斑马纹 / 表头），禁止指到 `--ku-bg-sidebar`。深色侧栏会让文字按钮和表格行的 hover 底变深、字色仍是正文色。

## 字体（强制）

- 正文只用系统 UI 无衬线栈（`--ku-font-family-base`，真源 `base-tokens.js`）：`-apple-system` → `PingFang SC` → `Microsoft YaHei` …
- **禁止**把未托管的展示字体（Noto Serif / Songti / Georgia serif）放进全局 body 栈。
- **禁止**为正文引入第三方品牌字体文件；等宽用 `--ku-font-family-mono`（代码、ID、日志）。

## 何时读 TOKEN.md

- 新增组件要用颜色/间距/圆角/阴影/层级
- 改 Element Plus 结构变量映射
- 评审是否破坏性变更（改名删除）

## 生成与校验

```bash
pnpm --filter @ku-utils/skin build   # 或包内 generate 脚本
```

改 `src/themes/tome.js` / base tokens 后必须重新生成 CSS，再在 playground / kv3-admin 看 loading 与弹层。

## 禁止

- apps 复制一份 hex 色板当「本地皮肤」
- antd 靠 `:root { --ant-* }` 覆写主题（未开 cssVar 时不生效）
- packages 写死品牌 hex 且无 `--ku-*` fallback
- mask / overlay 混用
- apps 样式写 `var(--未定义变量, #hex)`（fallback 永远生效 = 写死色值）或 Element 默认蓝 `#409eff` / `#3a8ee6` 等字面量
