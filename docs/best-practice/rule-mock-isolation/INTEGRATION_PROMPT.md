# 接入 Prompt：rule-mock-isolation

请落地 Mock 隔离规则（来源：ku-utils `docs/best-practice/rule-mock-isolation`）。

## 目标

1. 添加 `.cursor/rules/mock-isolation.mdc`，globs 绑 `**/_mock/**`、`src/mock/**`。
2. 写明：加载边界、**本仓**信封字面量、硬编码种子、禁 HTML 回落。
3. 与 [rule-api-contract](../rule-api-contract/) 信封表一致。
4. 抽查：业务是否 import mock；列表种子是否工厂生成。

## 完成后

给出 rule 路径、信封字面量、违规文件清单（若有）。
