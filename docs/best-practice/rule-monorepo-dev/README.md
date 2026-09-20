# rule-monorepo-dev — Monorepo 开发规范

> **参考接入**：供本项目或其他项目接入 `.cursor/rules` 时参考，非运行时依赖。  
> **本仓同步**：与 [`.cursor/rules/monorepo-dev.mdc`](../../../.cursor/rules/monorepo-dev.mdc) **双向同步**（见 [SYNC.md](../SYNC.md)）。

**类型**：Cursor Rule（`.mdc`）

pnpm workspace 依赖管理、新增包、Changesets 发版与 commit scope。

## 推进接入分数

| 维度         | 分         | 说明                              |
| ------------ | ---------- | --------------------------------- |
| 覆盖度       | 18/25      | 本仓专用；可移植到同类 monorepo   |
| 可执行性     | 24/25      | 命令与路径明确                    |
| 可移植性     | 20/25      | 需改 scope / 包名前缀             |
| Agent 可触发 | 13/15      | description 标明新增包/发版时读取 |
| 单一真源     | 10/10      | 本仓有独立 mdc                    |
| **合计**     | **85/100** |                                   |

## 最佳实践（精炼）

1. **包管理**：pnpm；根加依赖 `pnpm add -wD <pkg>`；子包 `pnpm add <pkg> --filter <workspace>`；仓内引用 `workspace:*`。
2. **新增能力**：先评估是否进现有 `@ku-utils/*`；确需新包则在 `packages/` 创建，必备 README / tsconfig / package.json（含 `publishConfig.access=public`）。
3. **构建**：纯 TS 用 tsup；Vue 组件库用 Vite。
4. **发版**：`pnpm changeset` → 合入 main → Version Packages PR → npm + tag；紧急本地 `pnpm release` 后 `git push --follow-tags`；semver：patch / minor / major。
5. **Commit**：`type(scope): 中文描述`；scope 为包名（与 `rule-commit-message` 一致）。

## 本仓落点

- [`.cursor/rules/monorepo-dev.mdc`](../../../.cursor/rules/monorepo-dev.mdc)
- 交叉：`docs/npm-publish.md`、`docs/contributing.md`、[skill-tooling-eslint-prettier-ts](../skill-tooling-eslint-prettier-ts/)

## 验收清单

- [ ] 新增依赖用对 filter / `-wD`，无误装到错误 workspace
- [ ] 新包具备 README + publishConfig
- [ ] 发版路径与 Changesets 文档一致
