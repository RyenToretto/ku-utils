# 接入 Prompt：rule-skill-admin-list-filter

> 本 Prompt 供 **本项目或其他项目** 参考接入用；需同时落地 `.cursor/rules` 与 `.cursor/skills`。

请在本仓库落实管理端「列表 + 筛选 + Mock」最佳实践（来源：ku-utils `docs/best-practice/rule-skill-admin-list-filter`）。

## 目标

1. 阅读现有列表页与 mock 插件，归纳本仓**真实**信封字段（`data` vs `result`、成功码 `0` vs `'0000'`），写入文档，**禁止照抄其他仓错误信封**。
2. 新增或更新 docs（如 `docs/admin-list-page-pattern.md`）：目录骨架、TableWrap/筛选/高度、弹层命名 `DialogXxx`。
3. 若有筛选面板组件：补充 rule/skill 说明折叠、`disableFold`、ctl 横向布局、loading 图标不撑宽。
4. 添加或强化 mock 隔离 rule：业务禁止 import `_mock`；种子硬编码要求按本仓现状写清。
5. 若有 Example 模块：写明环境变量门控与生产禁止打进包的手段。

## 约束

- 不一次性大重构所有列表；先文档 + rule，再挑 1 个样板页对齐（需你确认后再改码）。
- 完成后给出文档/rule 路径与「本仓信封」一句话定义。
