# 接入 Prompt：rule-task-ledger

请落地任务台账规范（来源：ku-utils `docs/best-practice/rule-task-ledger`）。

## 目标

1. 添加 `.cursor/rules/task-ledger.mdc`（或写入精简版并链到 `docs/task/`）。
2. 约定：
   - 任务 ID = `{owner}{seq}-{slug}`（如 `koujianfeng1-use-now`），**禁止**全局 `P1/P2/Pxx`，**禁止**无 slug 的 `{owner}{seq}.md`；取号扫 `{owner}{数字}-*.md`
   - 正文 `docs/task/{id}.md` = 全量档案
   - `TASK.md` = **按人 → 按状态** 的活跃看板（只改自己的 `## {owner}`）；完成/`❎` 出索引
   - **开新台账前**清理：全收口 + 不在活跃板 + 距最近 git 提交 ≥30 天 → 可删 `{owner}{seq}-{slug}.md`（永不删 `TASK.md` / 历史 `Pxx`）
   - emoji 状态、FE/BE 分流
3. 若有独立合同仓：加 skill `doc-backend-sync`（侦测上游 SHA → 先 cleanup → 开 `{owner}{seq}-{slug}` → 逐条提交），见 [rule-fe-be-doc-sync](../rule-fe-be-doc-sync/)。
4. 若启用确认队列：**统一** `docs/waitConfirm/<owner>/`（产品精确决策 + 合同精确合同）；**不要**再开 waitRD；QA 禁止写「收件人」；**合同仓已写死 / 纯 BE / 「是否按设计冻结」复读题禁止开 QA**（只问文档「待确认」且会改 FE 能力面、或文档完全没有的合同缝）；未回复仅阻塞该 QA 能力；门禁 `waitconfirm:ready`。
5. 库型仓（如纯组件库）可裁剪为「changelog + issue」等价物，但须在 context 声明「本仓不使用 docs/task」。

## 完成后

给出 rule 路径、台账目录、ID 示例、是否启用 waitConfirm（及 `<owner>/` 目录约定）、是否接入 `taskledger:cleanup`。
