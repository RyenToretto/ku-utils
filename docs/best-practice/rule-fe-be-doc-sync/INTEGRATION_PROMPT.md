# 接入 Prompt：rule-fe-be-doc-sync

请落实前后端合同 / 上游增量实践（来源：ku-utils `docs/best-practice/rule-fe-be-doc-sync`）。

## 目标

1. 明确合同真源（OpenAPI / 文档仓 / `docs/apis`）；写入环境变量名或相对路径约定。
2. 添加 `.cursor/rules/fe-be-doc-sync.mdc`：改 `_api` 必对合同；同步 mock；无合同须标假设。
3. 若有独立合同仓 + 实现仓：添加 `.cursor/skills/doc-backend-sync/SKILL.md`（侦测快照 → 开台账 → 逐条提交）；可参考 oversea 同名 skill。
4. 可选 waitRD/waitConfirm 目录结构（见 [rule-task-ledger](../rule-task-ledger/)）。
5. 与 [rule-api-contract](../rule-api-contract/) 信封/响应示例规则一致。

## 完成后

给出合同入口、rule/skill 路径、是否启用上游快照。
