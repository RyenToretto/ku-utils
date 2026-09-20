# 本仓 `.cursor` ↔ `docs/best-practice` 同步表

> **硬约束**：本仓库里**已经存在**的 Cursor Rules / Skills，必须在 `docs/best-practice` 有对应模块，且**改一边就要改另一边**。  
> 参考接入模块（本仓尚无独立 `.cursor` 文件）不强制回写 `.cursor`，但一旦落地成 rule/skill，必须立刻登记本表。

权威约定见 [`.cursor/rules/best-practice-sync.mdc`](../../.cursor/rules/best-practice-sync.mdc)。

## 已落地（必须双向同步）

| 本仓真源（`.cursor`）                                          | best-practice 模块                                                                                                | 备注                                              |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `.cursor/rules/best-practice-sync.mdc`                         | [SYNC.md](./SYNC.md) + [README.md](./README.md)                                                                   | 同步机制本身；无单独 `rule-*` 目录                |
| `.cursor/rules/project-context.mdc`                            | [rule-project-context](./rule-project-context/)                                                                   | 根级 alwaysApply                                  |
| `apps/kv3-admin/.cursor/rules/project-context.mdc`             | [rule-project-context](./rule-project-context/) + [rule-skill-admin-list-filter](./rule-skill-admin-list-filter/) | 管理端列表/Demo 约定以 admin-list-filter 为主摘要 |
| `.cursor/rules/commit-message.mdc`                             | [rule-commit-message](./rule-commit-message/)                                                                     |                                                   |
| `.cursor/rules/vue-standards.mdc`                              | [rule-vue-sfc-standards](./rule-vue-sfc-standards/)                                                               | 含 `--ku-*` 用法，与 theme-skin 交叉引用          |
| `.cursor/rules/monorepo-dev.mdc`                               | [rule-monorepo-dev](./rule-monorepo-dev/)                                                                         | 新增包 / 依赖 / 发版                              |
| `.cursor/rules/project-context.mdc`「演进原则」                | [rule-agent-guardrails](./rule-agent-guardrails/)                                                                 | 暂无独立 mdc；改演进原则时同步本模块              |
| `apps/kv3-admin/.cursor/rules/custom-columns-vue3-pattern.mdc` | [rule-skill-custom-columns](./rule-skill-custom-columns/)                                                         |                                                   |
| `apps/kv3-admin/.cursor/skills/custom-columns/SKILL.md`        | [rule-skill-custom-columns](./rule-skill-custom-columns/)                                                         |                                                   |
| `apps/kv3-admin/.cursor/skills/filter-panel-demo/SKILL.md`     | [rule-skill-admin-list-filter](./rule-skill-admin-list-filter/)                                                   | Demo 场景步骤                                     |

## 参考模块（本仓尚无独立 rule/skill）

| best-practice 模块                                                      | 说明                                                               | 落地后动作                         |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------- |
| [skill-tooling-eslint-prettier-ts](./skill-tooling-eslint-prettier-ts/) | 约束散落在 monorepo-dev / packages/*-config                        | 若新增 tooling skill → 登记上表    |
| [skill-theme-skin](./skill-theme-skin/)                                 | 真源在 `packages/skin`；规则散落在 project-context / vue-standards | 若新增 theme-skin skill → 登记上表 |
| [rule-skill-hooks-composables](./rule-skill-hooks-composables/)         | 真源在 `packages/hooks`                                            | 若新增 hooks skill/rule → 登记上表 |
| [rule-fe-be-doc-sync](./rule-fe-be-doc-sync/)                           | 本仓未落地 rule                                                    | 落地后登记上表                     |

## 全局机配置（`glb-*`，不进本仓 `.cursor`）

| best-practice 模块                                            | 本机真源（参考）                                                  | 说明                                           |
| ------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------- |
| [glb-chrome-debug-playwright](./glb-chrome-debug-playwright/) | `~/.cursor/skills/chrome-debug-playwright` + `~/bin/chrome-debug` | 他机按 INTEGRATION_PROMPT 安装                 |
| [glb-lark](./glb-lark/)                                       | `~/.agents/skills/lark-*` + `lark-cli`                            | 官方 `npx skills add larksuite/cli -g -y`      |
| [glb-book-to-skill](./glb-book-to-skill/)                     | `~/.agents/skills/book-to-skill`（转换器）                        | 生成 skill 默认仍全局；团队文档才进项目 skills |

`glb-*` **不**要求与本仓 `.cursor` 双向同步；若将来把某一份拷进仓库 `.cursor`，再升格到「已落地」表。

## Agent 操作清单

改 `.cursor/rules/**` 或 `.cursor/skills/**` 时：

1. 查本表找到对应模块。
2. 更新该模块 `README.md` 的「最佳实践（精炼）」与「本仓落点」（必要时改 `INTEGRATION_PROMPT.md`）。
3. 若是**新增** rule/skill：新建或扩展模块 + **本表加一行** + 更新 [README.md](./README.md) 模块地图（如有新目录）。
4. 若是**删除** rule/skill：更新本表；模块可降为「参考模块」或删除（需在 README 说明）。

改 `docs/best-practice/<已落地模块>/` 时：

1. 回写对应 `.cursor` 文件，避免文档比真源「超前」或「落后」。
2. 精炼条文可以比 `.mdc` 短，但**不得与真源矛盾**。
