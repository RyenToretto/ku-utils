# rule-project-context — 项目上下文

> **参考接入**：供本项目或其他项目接入 `.cursor/rules` 时参考，非运行时依赖。  
> **本仓同步**：与根 / kv3-admin 的 `project-context.mdc` **双向同步**（见 [SYNC.md](../SYNC.md)）。

**类型**：Cursor Rule（`.mdc`）

Agent 进入仓库后的**第一份真源**：技术栈、目录地图、硬约束、常用命令、Demo/Example 门控、rules↔best-practice 同步入口。

## 推进接入分数

| 维度         | 分         | 说明                                    |
| ------------ | ---------- | --------------------------------------- |
| 覆盖度       | 23/25      | 11+ 仓有 `project-context.mdc`          |
| 可执行性     | 22/25      | 需按仓改目录图，模板清晰                |
| 可移植性     | 20/25      | 结构通用；包名/命令因仓而异             |
| Agent 可触发 | 14/15      | `alwaysApply: true` 或 description 明确 |
| 单一真源     | 9/10       | 本仓已有根 + kv3-admin 分层             |
| **合计**     | **88/100** |                                         |

**缺口**：跨仓仍存在 `@do-power` 旧文案分叉；建议业务仓逐步指向本 BP 或 `@ku-utils` 表述。

## 最佳实践（精炼）

1. 每个可独立开发的仓根放 `.cursor/rules/project-context.mdc`。
2. 内容至少含：概要、目录地图、硬约束清单、常用命令、发版/门控（如有）。
3. Monorepo：根上下文 + 子应用（如 `apps/xxx/.cursor/rules`）分层，子应用不重复根级包列表。
4. `alwaysApply: true` 仅用于「几乎每次对话都需要」的仓级上下文；子域规则用 globs。
5. 禁止把密钥、内网账号写进 context。
6. 本仓：在 context 中声明 `docs/best-practice/SYNC.md` 同步入口（与 `best-practice-sync.mdc` 一致）。

## 本仓落点

- [`.cursor/rules/project-context.mdc`](../../../.cursor/rules/project-context.mdc)
- [`apps/kv3-admin/.cursor/rules/project-context.mdc`](../../../apps/kv3-admin/.cursor/rules/project-context.mdc)
- 同步机制：[`.cursor/rules/best-practice-sync.mdc`](../../../.cursor/rules/best-practice-sync.mdc)

## 验收清单

- [ ] 新开 Agent 对话，不额外粘贴说明也能答对「包在哪、怎么 build」
- [ ] 子应用规则不与根规则矛盾
- [ ] 无密钥/测试账号明文
