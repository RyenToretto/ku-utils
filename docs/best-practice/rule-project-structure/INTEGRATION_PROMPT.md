# 接入 Prompt：rule-project-structure

请在本仓库落地目录与命名规则（来源：ku-utils `docs/best-practice/rule-project-structure`）。

## 目标

1. 添加 `.cursor/rules/project-structure.mdc`（可 `alwaysApply: true` 或 globs `src/modules/**`）。
2. 写明：就近原则、子业务骨架、`DialogXxx` / `XxxLayer` / `XxxList` / `requestXxx` 命名。
3. 与瘦身 `project-context` 交叉引用；细则不重复堆进 context。
4. 若存在 `DrawerXxx` / 列表逻辑堆在 Layer：列整改清单，触达时改名。

## 完成后

给出 rule 路径与一个示例域目录树。
