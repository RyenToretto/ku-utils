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

1. 应用引入一套皮肤 CSS；**apps 不自建第二套色板**。
2. 组件写 `var(--ku-token, <默认浅色 fallback>)`，不把皮肤 CSS 打进 library 产物。
3. Element Plus：结构变量转发 `--ku-*`；色阶由脚本从品牌色生成。
4. **`--el-mask-color` → loading 浅色**（`--ku-loading-bg`）；**`--el-overlay-color` → 弹层深色**（`--ku-bg-overlay`）。勿混用。
5. 契约变更：新增 token 走 minor；改名删除走 major（见 TOKEN.md）。
6. **`--el-fill-color` / `-light` 用内容区中性底**（斑马纹 / 表头），不要指到侧栏。深色侧栏会让文字按钮和表格 hover 字色消失。
7. **正文字体用系统 UI 无衬线**（`base-tokens` 的 `--ku-font-family-base`）。禁止未托管宋体/衬线进 body；不引入第三方品牌字体文件。

## 本仓落点

- `packages/skin` + `TOKEN.md`
- [`.cursor/skills/theme-skin/SKILL.md`](../../../.cursor/skills/theme-skin/SKILL.md)
- 约束摘要亦见根 `project-context` / `vue-standards`（`--ku-*` fallback）

## 验收清单

- [ ] 表格 `v-loading` 为浅色磨砂，非黑色大罩
- [ ] 弹层遮罩仍足够暗
- [ ] packages/ui 无硬编码品牌色（允许 fallback）
