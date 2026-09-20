# 接入 Prompt：rule-skill-custom-columns

> 本 Prompt 供 **本项目或其他项目** 参考接入用；需同时落地 `.cursor/rules` 与 `.cursor/skills`。

请在本仓库落实 Vue3 自定义列最佳实践（来源：ku-utils `docs/best-practice/rule-skill-custom-columns`）。

## 目标

1. 确认是否已依赖 `@ku-utils/custom-columns`（或团队等价包）；未安装则提出安装命令，**征得同意后再装**。
2. 添加 `.cursor/skills/custom-columns/SKILL.md`：description 写明何时触发；正文含 Step0 依赖 → schema → composable → 表头 → 持久化。
3. 添加 `.cursor/rules/custom-columns-vue3-pattern.mdc`：固定列、slot、嵌套表头、禁止手写与 schema 双轨维护。
4. 若存在样板列表页：指出应改用 schema 驱动的文件路径；需要改码时先给计划再动手。
5. 包名若不是 `@ku-utils/*`：全文替换为实际包名，勿残留错误 scope。

## 完成后

给出 skill/rule 路径、依赖状态、以及一个最小接入文件清单。
