# 接入 Prompt：rule-fe-be-doc-sync

> 本 Prompt 供 **本项目或其他项目** 参考接入用；落地目标以 `.cursor/rules` 为主。

请在本仓库落实前后端合同 / 增量文档最佳实践（来源：ku-utils `docs/best-practice/rule-fe-be-doc-sync`）。

## 目标

1. 找到本仓现有 API 文档或 OpenAPI / apis.md / 类型真源；若没有，创建最小 `docs/api-contract.md`（信封、成功码、分页字段、错误码约定）。
2. 添加 `.cursor/rules/fe-be-doc-sync.mdc`：
   - 改 `_api` / 响应类型时必须核对合同
   - 变更要同步 mock（若有）与用户可见文案
   - 无合同时 Agent 必须标明假设
3. 可选：`incremental-api-docs` 习惯 —— 新变更追加「变更记录」小节，而非复制整份后端文档。
4. 不要虚构后端接口；不要在未确认时改生产环境配置。

## 完成后

给出合同入口路径、rule 路径，以及本仓信封/分页字段的一句话摘要。若本仓得分项原为弱项，说明落地后预期提升点。
