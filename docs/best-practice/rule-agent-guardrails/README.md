# rule-agent-guardrails — Agent 护栏与演进原则

> **参考接入**：供本项目或其他项目接入 `.cursor/rules` 时参考，非运行时依赖。  
> **本仓同步**：真源为 `.cursor/rules/agent-guardrails.mdc`；改 rule 须同步本模块（见 [SYNC.md](../SYNC.md)）。根 `project-context.mdc`「演进原则」仅为摘要，细则以本 rule 为准。

**类型**：Cursor Rule（`.mdc`）

控制 Agent 行为：禁无限兼容层、改到位、缺信息须澄清提问、危险操作需确认、中文协作。

## 推进接入分数

| 维度         | 分         | 说明                        |
| ------------ | ---------- | --------------------------- |
| 覆盖度       | 20/25      | 演进 + 澄清提问 + git/安全  |
| 可执行性     | 23/25      | 条文可直接照做              |
| 可移植性     | 23/25      | 通用                        |
| Agent 可触发 | 14/15      | `alwaysApply: true` 短 rule |
| 单一真源     | 9/10       | 独立 `agent-guardrails.mdc` |
| **合计**     | **89/100** |                             |

## 最佳实践（精炼）

1. **禁止兼容逃逸**：不写「转发桥接 / 废弃 shim」糊弄过去；重构直接改到位。
2. 确需过渡：TODO + 负责人 + 时间点，禁止无限期保留。
3. **澄清提问**：需求过宽或信息不足时，立刻在聊天里用 A/B/C 问 1～2 个关键问题并**停止**；无 `AskQuestion` / 结构化提问 UI 是常态，禁止声称「不可用」后跳过或自选默认。
4. 仅在用户说「按你默认继续」或上下文可唯一推断时才可自选默认，且须点名默认与理由。
5. 仅在用户要求时 commit / push / 改 git config；不默认 `--no-verify`。
6. 高风险：全量删文件、改 CI 密钥、生产配置 —— 先说明再执行。
7. 对话与 commit 描述用中文（团队约定时）。
8. 不主动泄露 `.env`、凭证；发现误提交要警示。

## 本仓落点

- `.cursor/rules/agent-guardrails.mdc`（`alwaysApply: true`）
- 根 `project-context.mdc`「演进原则」作摘要交叉引用

## 验收清单

- [x] 已落地独立 `agent-guardrails.mdc`
- [ ] Agent 面对「顺便兼容旧 API」会拒绝并改到位或要清理计划
- [ ] 缺信息时在聊天里直接编号提问并等待，不写「AskQuestion 不可用」后继续
- [ ] 未要求时不自动 commit
