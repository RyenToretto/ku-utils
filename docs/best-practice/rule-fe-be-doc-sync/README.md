# rule-fe-be-doc-sync — 前后端合同与上游增量

> **参考接入**：合同真源、增量同步、wait 队列与 Agent 技能。  
> **来源加强**：oversea `doc-backend-sync` skill；jx-dsp waitRD/waitConfirm + `docs/apis`。

**类型**：Cursor Rule + 可选 Skill（`doc-backend-sync`）

## 推进接入分数

| 维度         | 分         | 说明                         |
| ------------ | ---------- | ---------------------------- |
| 覆盖度       | 20/25      | 两仓已验证完整闭环           |
| 可执行性     | 22/25      | 侦测→台账→逐条提交可照做     |
| 可移植性     | 16/25      | 依赖合同仓/路径变量          |
| Agent 可触发 | 14/15      | skill description 明确       |
| 单一真源     | 8/10       | 合同仓 vs 实现仓角色清晰     |
| **合计**     | **80/100** | 从 55 上修（模块化后可推广） |

## 最佳实践（精炼）

1. **合同仓 vs 实现仓**：需求/接口真源与后端实现仓分离；冲突以合同仓为准；禁止把实现仓当 PRD。
2. **路径**：用环境变量（非业务 `VITE_` 打进包）；禁止文档散落本机绝对路径。
3. **落地顺序**：已确认合同 → 运行时接口 → Mock → 文档示例（只读形状）。
4. **前端 `docs/apis`（可选）**：按模块维护；与 `_api`/Mock 同形；设计稿未落地标状态。
5. **上游增量 Skill**：快照 SHA 记在 `TASK.md` → 侦测新 commit → 分析 FE 影响 → 开 `{owner}{seq}-{slug}` → 逐条 CDP + commit；纯 BE 标 `❎`。**禁止**再开 `Pnn` / 无 slug。
6. **wait 队列**：后端合同缺口 → waitRD；产品拍板 → waitConfirm；已确认必须消费移除，禁长期滞留。
7. 与 [rule-api-contract](../rule-api-contract/)、[rule-task-ledger](../rule-task-ledger/) 配合（台账 ID 约定以 task-ledger 为准）。

## 本仓落点

- 参考模块（ku-utils 库仓可不落地完整 wait 体系）
- 业务仓范本：oversea `.cursor/skills/doc-backend-sync/`；jx-dsp `docs/waitRD/` + `docs/apis/`

## 验收清单

- [ ] 有合同入口（仓路径变量或 docs 链接）
- [ ] Agent 改 API 会核对合同 / mock
- [ ] 若启用上游同步：TASK 有快照表
