# rule-commit-message — Git Commit 规范

> **参考接入**：供本项目或其他项目接入 `.cursor/rules` 时参考，非运行时依赖。  
> **本仓同步**：与 [`.cursor/rules/commit-message.mdc`](../../../.cursor/rules/commit-message.mdc) **双向同步**（见 [SYNC.md](../SYNC.md)）。

**类型**：Cursor Rule（`.mdc`）

统一 `type(scope): 中文描述`，配合 commitlint / husky。

## 推进接入分数

| 维度         | 分         | 说明                               |
| ------------ | ---------- | ---------------------------------- |
| 覆盖度       | 22/25      | 多仓同类；本仓有 rule + commitlint |
| 可执行性     | 25/25      | 格式明确、有示例                   |
| 可移植性     | 25/25      | 几乎零业务耦合                     |
| Agent 可触发 | 13/15      | rule 按需；建议写 commit 时读取    |
| 单一真源     | 10/10      | 本仓 rule 可作标准                 |
| **合计**     | **95/100** |                                    |

## 最佳实践（精炼）

```
type(scope): 中文描述
```

- `type` / `scope` 英文；**描述必须中文**。
- 常用 type：`feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert` `release`。
- scope：包名或模块名（如 `utils` / `kv3-admin` / `skin`）；无明确 scope 可省略括号。
- 由 commitlint + husky 强制；Agent **仅在用户明确要求提交时** 才 commit。
- 禁止 `--no-verify`（除非用户明确要求）。
- **禁止 AI 署名 trailer**：不得写入 `Co-authored-by: Cursor <cursoragent@cursor.com>`（及同类 Cursor/`cursoragent@` 行）；commitlint 规则 `forbid-ai-coauthor` 硬拒绝。husky `commit-msg` 会先剥离 Cursor Agent 自动注入的该行再校验。

## 本仓落点

- [`.cursor/rules/commit-message.mdc`](../../../.cursor/rules/commit-message.mdc)
- `commitlint.config.js`（含 `forbid-ai-coauthor`）+ husky `commit-msg`

## 验收清单

- [ ] 故意写英文 subject 会被 hook 拒绝（若已接 commitlint）
- [ ] 带 `Co-authored-by: Cursor <cursoragent@cursor.com>` 的 message 会被 commitlint 拒绝
- [ ] README/规则中有正反示例
