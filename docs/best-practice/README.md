# Agent 工程最佳实践（参考接入）

> **用途声明**：本目录给 **本项目（ku-utils）或其他项目** 做 **参考接入**，不是运行时依赖。  
> 打开模块的 `INTEGRATION_PROMPT.md`，粘贴到目标仓 Agent 即可落地 `.cursor/rules` / `.cursor/skills` / docs。

> **本仓同步（硬约束）**：凡本仓库**已经存在**的 `.cursor/rules` / `.cursor/skills`，必须在本目录有对应模块，并与真源**双向保持同步**。  
> 对照表与操作清单见 **[SYNC.md](./SYNC.md)**；Agent 规则见 [`.cursor/rules/best-practice-sync.mdc`](../../.cursor/rules/best-practice-sync.mdc)。  
> 对外「参考接入」≠ 免同步：改本仓 rule/skill 时仍要更新本目录。

## 命名约定

| 前缀           | 含义                                   | 落地重点                                                                   |
| -------------- | -------------------------------------- | -------------------------------------------------------------------------- |
| `rule-*`       | 以 **Cursor Rules**（`.mdc`）为主      | 约定、约束、alwaysApply / globs                                            |
| `skill-*`      | 以 **Cursor Skills**（`SKILL.md`）为主 | 多步流程、按需触发                                                         |
| `rule-skill-*` | **Rules + Skills** 都要                | 既有硬约束也有分步接入指南                                                 |
| `glb-*`        | **Global** 本机/他机用户目录配置       | `~/bin`、`~/.cursor/skills`、`~/.agents/skills` 等；**不**进本仓 `.cursor` |
| `_inventory/`  | 盘点摘要                               | 仅说明来源，不可「接入」                                                   |

## 怎么用

1. 看 [SYNC.md](./SYNC.md) 确认是否「本仓已落地」模块。
2. 按需选模块，读 `README.md`（含推进接入分数 /100）。
3. 复制同目录 `INTEGRATION_PROMPT.md` 到目标仓 Agent。
4. 落地后按验收清单自测；若在本仓改了 `.cursor`，同步更新本目录。

## 模块地图（建议接入顺序）

| 顺序 | 目录                                                                    | 类型       | 一句话                       | 本仓得分 |
| ---- | ----------------------------------------------------------------------- | ---------- | ---------------------------- | -------- |
| 1    | [rule-project-context](./rule-project-context/)                         | rule       | 项目上下文真源               | 88       |
| 2    | [rule-commit-message](./rule-commit-message/)                           | rule       | `type(scope): 中文`          | 95       |
| 3    | [rule-agent-guardrails](./rule-agent-guardrails/)                       | rule       | 禁兼容层、Agent 护栏         | 82       |
| 4    | [rule-monorepo-dev](./rule-monorepo-dev/)                               | rule       | 依赖 / 新包 / 发版           | 85       |
| 5    | [skill-tooling-eslint-prettier-ts](./skill-tooling-eslint-prettier-ts/) | skill      | ESLint / Prettier / tsconfig | 90       |
| 6    | [rule-vue-sfc-standards](./rule-vue-sfc-standards/)                     | rule       | Vue SFC + CSS                | 90       |
| 7    | [skill-theme-skin](./skill-theme-skin/)                                 | skill      | `--ku-*` 皮肤                | 92       |
| 8    | [rule-skill-hooks-composables](./rule-skill-hooks-composables/)         | rule+skill | hooks 约定                   | 85       |
| 9    | [rule-skill-admin-list-filter](./rule-skill-admin-list-filter/)         | rule+skill | 列表 + 筛选 + mock           | 80       |
| 10   | [rule-skill-custom-columns](./rule-skill-custom-columns/)               | rule+skill | Vue3 自定义列                | 93       |
| 11   | [rule-fe-be-doc-sync](./rule-fe-be-doc-sync/)                           | rule       | 前后端合同与增量文档         | 55       |

### 全局机配置（`glb-*`，可选）

| 顺序 | 目录                                                          | 类型        | 一句话                              | 参考得分 |
| ---- | ------------------------------------------------------------- | ----------- | ----------------------------------- | -------- |
| G1   | [glb-chrome-debug-playwright](./glb-chrome-debug-playwright/) | glb / skill | Chrome Debug Profile + CDP 9222     | 80       |
| G2   | [glb-lark](./glb-lark/)                                       | glb / cli   | 飞书 lark-cli + 整套 lark-\* skills | 89       |
| G3   | [glb-book-to-skill](./glb-book-to-skill/)                     | glb / skill | 书籍/文档 → 结构化 Agent Skill      | 83       |

## 计分口径（满分 100）

| 维度                               | 分值 |
| ---------------------------------- | ---- |
| 覆盖度（多仓已验证）               | 25   |
| 可执行性（规则可照做）             | 25   |
| 可移植性（少业务耦合）             | 25   |
| Agent 可触发（有 skill/rule 钩子） | 15   |
| 单一真源 / 可维护                  | 10   |

## 盘点真源

原始扫描摘要见 [_inventory/README.md](./_inventory/README.md)。

## 维护

- **本仓已有 rule/skill**：改真源或改本目录，必须按 [SYNC.md](./SYNC.md) 成对更新。
- 新增模块：按 `rule-` / `skill-` / `rule-skill-` / `glb-` 建目录，更新本表 + `SYNC.md`。
- 仅参考、本仓未落地的模块：可不回写 `.cursor`；一旦落地立即登记同步。
- `glb-*`：只指导用户主目录安装；**不**要求回写本仓 `.cursor`。
