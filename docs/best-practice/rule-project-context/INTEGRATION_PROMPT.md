# 接入 Prompt：rule-project-context（瘦身壳）

> 来源：ku-utils `docs/best-practice/rule-project-context`。  
> 目标：落地**瘦身** `.cursor/rules/project-context.mdc`，并把专题拆到独立 rules（见 `_decomposition`）。

## 目标

1. 若已有巨石 `project-context.mdc`（&gt;200 行）：**不要删业务知识**，按 [_decomposition/README.md](../_decomposition/README.md) 迁到专题文件，context 只留壳。
2. 新建或改写 `project-context.mdc`（`alwaysApply: true`），必须含：
   - 产品一句话 + 中文协作
   - **合同冻结表**（成功码 / 载荷字段 / 未登录 / ID 类型 — 按本仓真实拦截器填写）
   - 提交门禁命令
   - 关联仓环境变量名（禁止绝对路径）
   - **专题模块索引**（链到本仓 `.cursor/rules/*.mdc`）
3. 禁止把列表四要素、选择器百科、Mock 种子规则继续堆在 context。
4. 同步更新 `docs/best-practice` 对应模块或本仓 README 索引（若该仓维护 BP）。

## 完成后

给出：context 路径与行数、拆出的专题文件列表、合同冻结表摘要。
