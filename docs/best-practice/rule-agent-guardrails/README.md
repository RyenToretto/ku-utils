# rule-agent-guardrails — Agent 护栏与演进原则

> **参考接入**：供本项目或其他项目接入 `.cursor/rules` 时参考，非运行时依赖。  
> **本仓同步**：真源暂为根 `project-context.mdc`「演进原则」；改该段须同步本模块（见 [SYNC.md](../SYNC.md)）。

**类型**：Cursor Rule（`.mdc`）

控制 Agent 行为：禁无限兼容层、改到位、危险操作需确认、中文协作。

## 推进接入分数

| 维度         | 分         | 说明                                           |
| ------------ | ---------- | ---------------------------------------------- |
| 覆盖度       | 18/25      | ku-utils 演进原则强；他仓部分 karpathy/consent |
| 可执行性     | 22/25      | 条文清晰                                       |
| 可移植性     | 23/25      | 通用                                           |
| Agent 可触发 | 12/15      | 宜 alwaysApply 短 rule                         |
| 单一真源     | 7/10       | 建议抽独立 `agent-guardrails.mdc`              |
| **合计**     | **82/100** |                                                |

## 最佳实践（精炼）

1. **禁止兼容逃逸**：不写「转发桥接 / 废弃 shim」糊弄过去；重构直接改到位。
2. 确需过渡：TODO + 负责人 + 时间点，禁止无限期保留。
3. 仅在用户要求时 commit / push / 改 git config；不默认 `--no-verify`。
4. 高风险：全量删文件、改 CI 密钥、生产配置 —— 先说明再执行。
5. 对话与 commit 描述用中文（团队约定时）。
6. 不主动泄露 `.env`、凭证；发现误提交要警示。

## 本仓落点

- 根 `project-context.mdc`「演进原则」
- 建议补强：独立 `.cursor/rules/agent-guardrails.mdc`（alwaysApply）

## 验收清单

- [ ] Agent 面对「顺便兼容旧 API」会拒绝并改到位或要清理计划
- [ ] 未要求时不自动 commit
