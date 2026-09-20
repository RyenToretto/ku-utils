# 接入 Prompt：rule-skill-admin-list-filter

> 需同时考虑独立模块：[rule-mock-isolation](../rule-mock-isolation/)、[rule-skill-entity-selector](../rule-skill-entity-selector/)。

请落实管理端列表 / 筛选最佳实践（来源：ku-utils `docs/best-practice/rule-skill-admin-list-filter`）。

## 目标

1. 归纳本仓**真实**信封（禁止照抄他仓）；写入 [rule-api-contract](../rule-api-contract/) / context 冻结表。
2. 添加 `.cursor/rules/admin-list-filter.mdc`（或等价）：四要素、筛选顺序、操作列、Cell*、刷新/排序摘要。
3. Mock / 选择器**不要**堆进本 rule → 分别接入 mock-isolation、entity-selector。
4. 更新或新建 `docs/admin-list-page-pattern.md`；可选 filter Demo skill。
5. 挑 1 个样板页对齐（改码前先确认）。

## 完成后

给出 rule/docs 路径、「本仓信封」一句话、样板页路径。
