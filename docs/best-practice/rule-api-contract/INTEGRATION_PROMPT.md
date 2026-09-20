# 接入 Prompt：rule-api-contract

请落地 API / 字典合同规则（来源：ku-utils `docs/best-practice/rule-api-contract`）。

## 目标

1. 添加 `.cursor/rules/api-contract.mdc`（或等价名）。
2. 与瘦身 `project-context` 的合同冻结表交叉引用；此处写请求入口、禁兼容、响应示例、`$MAPS`。
3. 核对 axios 拦截器成功码/载荷字段与冻结表一致。
4. 抽查：页面是否仍有文档示例静态 options、双字段 `??` 兜底。

## 完成后

给出 rule 路径、冻结表摘要、发现的兼容债（若有）。
