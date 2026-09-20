# 本仓 `.cursor` ↔ `docs/best-practice` 同步表

> **硬约束**：本仓库里**已经存在**的 Cursor Rules / Skills，必须在 `docs/best-practice` 有对应模块，且**改一边就要改另一边**。  
> 参考接入模块（本仓尚无独立 `.cursor` 文件）不强制回写 `.cursor`，但一旦落地成 rule/skill，必须立刻登记本表。

权威约定见 [`.cursor/rules/best-practice-sync.mdc`](../../.cursor/rules/best-practice-sync.mdc)。  
巨石拆分见 [_decomposition/README.md](./_decomposition/README.md)。

## 已落地（必须双向同步）

| 本仓真源（`.cursor`）                                          | best-practice 模块                                                                                                | 备注                |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------- |
| `.cursor/rules/best-practice-sync.mdc`                         | [SYNC.md](./SYNC.md) + [README.md](./README.md)                                                                   | 同步机制            |
| `.cursor/rules/project-context.mdc`                            | [rule-project-context](./rule-project-context/)                                                                   | 瘦身壳 + 模块化索引 |
| `apps/kv3-admin/.cursor/rules/project-context.mdc`             | [rule-project-context](./rule-project-context/) + [rule-skill-admin-list-filter](./rule-skill-admin-list-filter/) | 管理端摘要          |
| `.cursor/rules/commit-message.mdc`                             | [rule-commit-message](./rule-commit-message/)                                                                     |                     |
| `.cursor/rules/vue-standards.mdc`                              | [rule-vue-sfc-standards](./rule-vue-sfc-standards/)                                                               |                     |
| `.cursor/rules/monorepo-dev.mdc`                               | [rule-monorepo-dev](./rule-monorepo-dev/)                                                                         |                     |
| `.cursor/rules/project-context.mdc`「演进原则」                | [rule-agent-guardrails](./rule-agent-guardrails/)                                                                 |                     |
| `apps/kv3-admin/.cursor/rules/custom-columns-vue3-pattern.mdc` | [rule-skill-custom-columns](./rule-skill-custom-columns/)                                                         |                     |
| `apps/kv3-admin/.cursor/skills/custom-columns/SKILL.md`        | [rule-skill-custom-columns](./rule-skill-custom-columns/)                                                         |                     |
| `apps/kv3-admin/.cursor/skills/filter-panel-demo/SKILL.md`     | [rule-skill-admin-list-filter](./rule-skill-admin-list-filter/)                                                   |                     |
| `.cursor/skills/theme-skin/SKILL.md`                           | [skill-theme-skin](./skill-theme-skin/)                                                                           | `@ku-utils/skin`    |
| `.cursor/rules/hooks-guide.mdc`                                | [rule-skill-hooks-composables](./rule-skill-hooks-composables/)                                                   |                     |
| `.cursor/skills/hooks/SKILL.md`                                | [rule-skill-hooks-composables](./rule-skill-hooks-composables/)                                                   |                     |
| `.cursor/skills/tooling/SKILL.md`                              | [skill-tooling-eslint-prettier-ts](./skill-tooling-eslint-prettier-ts/)                                           |                     |
| `apps/kv3-admin/.cursor/rules/project-structure.mdc`           | [rule-project-structure](./rule-project-structure/)                                                               | kv3-admin 目录约定  |

## 参考模块（本仓尚无独立 rule/skill）

| best-practice 模块                                          | 说明                   | 落地后动作 |
| ----------------------------------------------------------- | ---------------------- | ---------- |
| [rule-api-contract](./rule-api-contract/)                   | API/字典/响应示例      | 同上       |
| [rule-skill-entity-selector](./rule-skill-entity-selector/) | 选择器双模金标         | 同上       |
| [rule-mock-isolation](./rule-mock-isolation/)               | Mock 隔离              | 同上       |
| [rule-user-visible-copy](./rule-user-visible-copy/)         | 用户可见文案           | 同上       |
| [rule-task-ledger](./rule-task-ledger/)                     | 任务台账               | 同上       |
| [rule-fe-be-doc-sync](./rule-fe-be-doc-sync/)               | 合同与上游增量         | 同上       |
| [_decomposition](./_decomposition/)                         | 拆分指南（非接入模块） | —          |

## 全局机配置（`glb-*`）

| best-practice 模块                                            | 本机真源（参考）                                 | 说明 |
| ------------------------------------------------------------- | ------------------------------------------------ | ---- |
| [glb-chrome-debug-playwright](./glb-chrome-debug-playwright/) | `chrome-debug-playwright` + `~/bin/chrome-debug` |      |
| [glb-lark](./glb-lark/)                                       | `lark-*` + `lark-cli`                            |      |
| [glb-book-to-skill](./glb-book-to-skill/)                     | `book-to-skill`                                  |      |

## 外部仓对照（只读，勿当本仓同步义务）

| 仓                   | 典型路径                                                                                     | 对应 BP                                  |
| -------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------- |
| jx-dsp               | 巨石 `project-context.mdc`                                                                   | 拆分见 `_decomposition`；专题见 B 组模块 |
| oversea-creative-web | `project-context` + `project-structure` + `selector` + `mock-isolation` + `doc-backend-sync` | 拆分后范本                               |

## Agent 操作清单

改本仓 `.cursor/rules|skills` → 更新对应 BP 模块。  
改已落地 BP 模块 → 回写 `.cursor`。  
新增参考模块并在业务仓落地 `.cursor` 后 → 升格 SYNC 上表。
