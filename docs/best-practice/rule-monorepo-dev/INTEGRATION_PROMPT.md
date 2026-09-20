# 接入 Prompt：rule-monorepo-dev

> 本 Prompt 供 **本项目或其他项目** 参考接入用；落地目标为 `.cursor/rules/monorepo-dev.mdc`。

请在本仓库落实 Monorepo 开发规范最佳实践（来源：ku-utils `docs/best-practice/rule-monorepo-dev`）。

## 目标

1. 确认包管理器（建议 pnpm）与 workspace 声明文件。
2. 新增 `.cursor/rules/monorepo-dev.mdc`（或等价名），覆盖：
   - 根 / 子包加依赖命令
   - workspace 协议（如 `workspace:*`）
   - 新包目录与必备文件（README、package.json、构建工具）
   - 发版流程（Changesets 或本仓等价物）
   - commit `type(scope)` 与包名 scope 列表（可链到 commit-message rule）
3. 与现有 `project-context` / `commit-message` 不矛盾；重复条文以一处为真源并交叉引用。
4. 若本仓是「消费方」而非发版仓：删掉 npm publish 段，改为「如何升 `@org/*` 版本」。

## 完成后

给出 rule 路径，以及「新增一个示例包」的三步命令清单。
