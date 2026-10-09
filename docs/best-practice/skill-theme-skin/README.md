# skill-theme-skin — 统一皮肤 / Token

> **参考接入**：供本项目或其他项目接入 `.cursor/skills` 时参考，非运行时依赖。  
> **本仓同步**：与 [`.cursor/skills/theme-skin/SKILL.md`](../../../.cursor/skills/theme-skin/SKILL.md) **双向同步**（见 [SYNC.md](../SYNC.md)）。

**类型**：Cursor Skill（`SKILL.md`）

唯一语义前缀（本生态 `--ku-*`）；组件带 fallback；`--el-*` 桥接；loading mask ≠ 弹层 overlay。

## 推进接入分数

| 维度         | 分         | 说明                                |
| ------------ | ---------- | ----------------------------------- |
| 覆盖度       | 22/25      | theme-skin skill 多仓；本仓 skin 包 |
| 可执行性     | 24/25      | TOKEN.md + generate                 |
| 可移植性     | 22/25      | 换前缀需改文档，概念可迁移          |
| Agent 可触发 | 14/15      | skill + TOKEN                       |
| 单一真源     | 10/10      | `packages/skin`                     |
| **合计**     | **92/100** |                                     |

## 最佳实践（精炼）

1. 应用引入金标皮肤 CSS（`@ku-utils/skin` = `tome`）；**apps 不自建第二套色板**。
2. 组件写 `var(--ku-token, <tome 浅色 fallback>)`，不把皮肤 CSS 打进 library 产物。
3. Element Plus：结构变量与色阶全部转发 `--ku-*`（色阶 `--ku-color-{family}-light-1..9` / `-dark-2` / `-rgb` 由脚本从品牌色生成）；转发写在 `:root, html.dark` 共享块，skin 须在 Element Plus `element-plus/theme-chalk/dark/css-vars.css` 之后引入。明暗只认 `html.dark`，禁 `data-theme` / 页面自造暗色选择器当主方案。
   非 Element 栈（antd / ng-zorro 的 plain 按钮等）与 Element Plus 同值时读 `--ku-color-*` 色阶，禁读 `--el-*`、禁自己 `color-mix` 近似。
4. **`--el-mask-color` → loading 浅色**（`--ku-loading-bg`）；**`--el-overlay-color` → 弹层深色**（`--ku-bg-overlay`）。勿混用。
5. 契约变更：新增 token 走 minor；改名删除走 major（见 TOKEN.md）。
6. **`--el-fill-color` / `-light` 用内容区中性底**（斑马纹 / 表头），不要指到侧栏。深色侧栏会让文字按钮和表格 hover 字色消失。
7. **正文字体用系统 UI 无衬线**（`base-tokens` 的 `--ku-font-family-base`）。禁止未托管宋体/衬线进 body；不引入第三方品牌字体文件。
8. **唯一金标 `tome`**，不维护多套备选皮肤。
9. **JS 主题系统（antd）用 `@ku-utils/skin/tokens` 已解析色值**：不写 `var()`（无法派生色阶）、不手抄 hex、不靠 `:root --ant-*`（未开 cssVar 不生效）；暗色算法改写的品牌/状态色按皮肤值钉回。
10. **编译期写死色值的组件库（Element UI chalk / ng-zorro less）用构建期生成器整体换皮**：按「属性语境 + 字面量」映射到中性色表与状态色阶，目标是 Element Plus 组件内实际生效值（EP 在组件选择器上重新声明 `--el-input-bg-color` 等，默认指回通用中性色，`:root` 上的同名组件变量对 EP 不生效）；弹层 / 对话框阴影整值映射到 `--el-box-shadow*`；未映射字面量让生成失败，保留项显式登记；产物 gitignore、`predev` / `prebuild` 生成，不再引入原始主题 CSS。手写「换色覆写层」永远补不全（radio 悬停、表格行悬停、弹层底色都会漏）。
11. **验收覆盖悬停与弹层**：四端明暗实测表格行 / radio / 菜单 / 分页悬停与头像菜单、下拉、日期面板、对话框、确认框；出现蓝紫色相或暗色大块浅底即漏色。apps 禁写 `var(--未定义变量, #hex)`（fallback 永远生效 = 写死色值）与 Element 默认蓝 `#409eff` / `#3a8ee6` 等字面量。

## 本仓落点

- `packages/skin` + `TOKEN.md`（CSS：`@ku-utils/skin`；JS：`@ku-utils/skin/tokens`）
- antd 接入：`apps/kr-admin/src/plugins/antdTheme.ts`
- Element UI 接入：`apps/kv2-admin/scripts/generate-element-theme.mjs`（chalk → `--el-*` / `--ku-*`）+ `src/assets/styles/modules/element-ui-bridge.scss`（只放与 Element Plus 的结构 / 按钮态差异）
- ng-zorro 接入：`apps/ka-admin/scripts/generate-zorro-theme.mjs`（less 编译源样式 → `--ku-*`，未映射字面量即失败）+ `src/assets/styles/zorro-ku-bridge.scss`
- [`.cursor/skills/theme-skin/SKILL.md`](../../../.cursor/skills/theme-skin/SKILL.md)
- 约束摘要亦见根 `project-context` / `vue-standards`（`--ku-*` fallback）

## 验收清单

- [ ] 表格 `v-loading` 为浅色磨砂，非黑色大罩
- [ ] 弹层遮罩仍足够暗
- [ ] packages/ui 无硬编码品牌色（允许 fallback）
- [ ] antd 应用明暗切换后正文色 / 主按钮 / 卡片底与 `--ku-*` 一致
- [ ] Element Plus 应用暗色下 `--el-bg-color` / `--el-text-color-*` 等为 skin 值，而非 Element Plus 灰色系
- [ ] 四端明暗：悬停（表格行 / radio / 菜单 / 分页）与弹层（头像菜单 / 下拉 / 日期 / 对话框 / 确认框）无蓝紫色相、无暗色浅底
