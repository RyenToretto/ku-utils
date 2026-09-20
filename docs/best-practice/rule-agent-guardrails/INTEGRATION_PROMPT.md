# 接入 Prompt：rule-agent-guardrails

> 本 Prompt 供 **本项目或其他项目** 参考接入用；落地目标以 `.cursor/rules` 为主。

请在本仓库落实 Agent 护栏最佳实践（来源：ku-utils `docs/best-practice/rule-agent-guardrails`）。

## 目标

1. 新增 `.cursor/rules/agent-guardrails.mdc`，建议 `alwaysApply: true`，保持**短**（一屏内）。
2. 必须写入：
   - 禁止为兼容旧写法加转发桥接 / 无限期 shim；过渡必须有清理计划
   - 仅用户明确要求时才 git commit / push
   - 不跳过 hooks（除非用户明确要求）
   - 不提交密钥；发现则警告
   - 团队语言约定（如中文回复 / 中文 commit）
3. 若根 `project-context` 已有「演进原则」：guardrails 可引用之，避免大段重复。
4. 不要与安全策略冲突（例如公司要求保留某废弃 API 的，写成例外条目）。

## 完成后

给出 rule 路径与最终条文摘要（≤10 条 bullet）。
