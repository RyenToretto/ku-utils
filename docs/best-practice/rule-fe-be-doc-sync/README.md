# rule-fe-be-doc-sync — 前后端合同与增量文档

> **参考接入**：供本项目或其他项目接入 `.cursor/rules` 时参考，非运行时依赖。

**类型**：Cursor Rule（`.mdc`）

接口变更时同步类型/文档；避免「前端先猜字段」。

## 推进接入分数

| 维度         | 分         | 说明                                           |
| ------------ | ---------- | ---------------------------------------------- |
| 覆盖度       | 12/25      | 仅部分仓有 sync rule（ai-router、picpopop 等） |
| 可执行性     | 15/25      | 依赖团队是否有 OpenAPI/文档仓                  |
| 可移植性     | 15/25      | 流程可移植，工具链各异                         |
| Agent 可触发 | 8/15       | 有 rule 时好用，本仓较弱                       |
| 单一真源     | 5/10       | 本仓尚无统一 fe-be sync rule                   |
| **合计**     | **55/100** | 优先补齐本仓后再对外推广                       |

## 最佳实践（精炼）

1. **合同先行**：字段名、类型、枚举、错误码以约定文档或 OpenAPI 为准。
2. 前端改 `_api` / types 时，检查是否需更新 docs 或 mock 种子。
3. 后端改响应时，开「确认同步」清单：类型、Mock、列表展示、空态。
4. 增量 API 文档：只记变更 delta，避免整本复制腐烂。
5. Agent：无文档时标注「假设」，禁止把假设写成已确认合同。

## 本仓落点

- 待建：建议 `.cursor/rules/fe-be-doc-sync.mdc` + `docs/` 下 API 约定入口
- 参考他仓：`frontend-backend-confirm-sync.mdc`、`incremental-api-docs.mdc`

## 验收清单

- [ ] 有一份「接口合同入口」链接（哪怕是简短 markdown）
- [ ] Agent 改 API 时会提示同步 mock/docs
