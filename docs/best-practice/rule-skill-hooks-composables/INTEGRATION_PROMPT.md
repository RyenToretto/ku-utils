# 接入 Prompt：rule-skill-hooks-composables

> 本 Prompt 供 **本项目或其他项目** 参考接入用；需同时落地 `.cursor/rules` 与 `.cursor/skills`。

请在本仓库落实 Hooks / Composables 最佳实践（来源：ku-utils `docs/best-practice/rule-skill-hooks-composables`）。

## 目标

1. 盘点：共享 hooks 包 vs `src/composables` 各有哪些；列出重复实现（debounce loading、countdown 等）。
2. 添加 `.cursor/skills/hooks/SKILL.md`：何时用共享包、何时写本地 composable、命名与返回约定。
3. 添加 `.cursor/rules/hooks-guide.mdc`（globs 指向 hooks/composables 目录）。
4. 若已依赖 `@ku-utils/hooks`：在 skill 中写明推荐 API 列表（以本仓 package exports 为准）。
5. 不要大规模删改业务代码；最多给「可替换点」清单。

## 完成后

输出 skill/rule 路径 + 重复实现 Top 3。
