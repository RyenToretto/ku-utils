# 接入 Prompt：rule-task-ledger

请落地任务台账规范（来源：ku-utils `docs/best-practice/rule-task-ledger`）。

## 目标

1. 添加 `.cursor/rules/task-ledger.mdc`（或写入精简版并链到 `docs/task/README`）。
2. 约定 `docs/task/Pxx-*.md` + `TASK.md`、emoji 状态、FE/BE 分流。
3. 若有独立合同仓：加 skill `doc-backend-sync`（侦测上游 SHA → 开台账 → 逐条提交），见 [rule-fe-be-doc-sync](../rule-fe-be-doc-sync/)。
4. 库型仓（如纯组件库）可裁剪为「changelog + issue」等价物，但须在 context 声明「本仓不使用 docs/task」。

## 完成后

给出 rule 路径、台账目录、是否启用 wait 队列。
