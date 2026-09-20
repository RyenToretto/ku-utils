# Agent 工程最佳实践（参考接入）

> **用途声明**：本目录给 **本项目（ku-utils）或其他项目** 做 **参考接入**，不是运行时依赖。  
> 打开模块的 `INTEGRATION_PROMPT.md`，粘贴到目标仓 Agent 即可落地 `.cursor/rules` / `.cursor/skills` / docs。

> **本仓同步（硬约束）**：凡本仓库**已经存在**的 `.cursor/rules` / `.cursor/skills`，必须在本目录有对应模块，并与真源**双向保持同步**。  
> 对照表：**[SYNC.md](./SYNC.md)**；拆分巨石 context：**[_decomposition/README.md](./_decomposition/README.md)**。

## 命名约定

| 前缀              | 含义                        | 落地重点                  |
| ----------------- | --------------------------- | ------------------------- |
| `rule-*`          | Cursor Rules（`.mdc`）      | 约定、alwaysApply / globs |
| `skill-*`         | Cursor Skills（`SKILL.md`） | 多步流程                  |
| `rule-skill-*`    | Rules + Skills              | 硬约束 + 接入步骤         |
| `glb-*`           | 本机/他机全局配置           | 不进仓 `.cursor`          |
| `_decomposition/` | 巨石 context 拆分指南       | 必读（管理端）            |
| `_inventory/`     | 盘点摘要                    | 不可「接入」              |

## 怎么用（管理端推荐）

1. 读 [_decomposition/README.md](./_decomposition/README.md)（若从巨石 context 迁移）。
2. 按下方「管理端模块化」顺序接入；**先瘦身 context，再挂专题**。
3. 每模块复制 `INTEGRATION_PROMPT.md` 到目标仓 Agent。
4. 合同冻结表必须按**本仓拦截器**填写，禁止抄错信封。

## 模块地图

### A. 壳层与工程

| 顺序 | 目录                                                                    | 类型  | 一句话                    | 得分 |
| ---- | ----------------------------------------------------------------------- | ----- | ------------------------- | ---- |
| 1    | [rule-project-context](./rule-project-context/)                         | rule  | **瘦身**上下文 + 专题索引 | 93   |
| 2    | [rule-project-structure](./rule-project-structure/)                     | rule  | Layer/_module/Dialog 命名 | 88   |
| 3    | [rule-commit-message](./rule-commit-message/)                           | rule  | `type(scope): 中文`       | 95   |
| 4    | [rule-agent-guardrails](./rule-agent-guardrails/)                       | rule  | 禁兼容层、护栏            | 82   |
| 5    | [rule-monorepo-dev](./rule-monorepo-dev/)                               | rule  | 依赖/新包/发版            | 85   |
| 6    | [skill-tooling-eslint-prettier-ts](./skill-tooling-eslint-prettier-ts/) | skill | ESLint/Prettier/tsconfig  | 90   |
| 7    | [rule-vue-sfc-standards](./rule-vue-sfc-standards/)                     | rule  | Vue SFC + CSS             | 90   |

### B. 管理端模块化（自 jx-dsp / oversea 拆分）

| 顺序 | 目录                                                            | 类型       | 一句话                 | 得分 |
| ---- | --------------------------------------------------------------- | ---------- | ---------------------- | ---- |
| 8    | [rule-api-contract](./rule-api-contract/)                       | rule       | 信封/字典/响应示例边界 | 84   |
| 9    | [rule-skill-admin-list-filter](./rule-skill-admin-list-filter/) | rule+skill | 列表/筛选/操作列/Cell  | 89   |
| 10   | [rule-skill-entity-selector](./rule-skill-entity-selector/)     | rule+skill | 实体选择器双模金标     | 84   |
| 11   | [rule-mock-isolation](./rule-mock-isolation/)                   | rule       | Mock 隔离与种子        | 87   |
| 12   | [rule-user-visible-copy](./rule-user-visible-copy/)             | rule       | 用户可见文案           | 88   |
| 13   | [rule-task-ledger](./rule-task-ledger/)                         | rule       | 任务台账与 wait 队列   | 78   |
| 14   | [rule-fe-be-doc-sync](./rule-fe-be-doc-sync/)                   | rule+skill | 合同与上游增量同步     | 80   |
| 15   | [rule-skill-hooks-composables](./rule-skill-hooks-composables/) | rule+skill | hooks 约定             | 85   |
| 16   | [rule-skill-custom-columns](./rule-skill-custom-columns/)       | rule+skill | Vue3 自定义列          | 93   |
| 17   | [skill-theme-skin](./skill-theme-skin/)                         | skill      | 皮肤 / Token           | 92   |

### C. 全局机配置（`glb-*`，可选）

| 顺序 | 目录                                                          | 类型 | 一句话                 | 得分 |
| ---- | ------------------------------------------------------------- | ---- | ---------------------- | ---- |
| G1   | [glb-chrome-debug-playwright](./glb-chrome-debug-playwright/) | glb  | Chrome Debug + CDP     | 80   |
| G2   | [glb-lark](./glb-lark/)                                       | glb  | 飞书 lark-cli + skills | 89   |
| G3   | [glb-book-to-skill](./glb-book-to-skill/)                     | glb  | 书/文档 → Skill        | 83   |

## 计分口径（满分 100）

| 维度              | 分值 |
| ----------------- | ---- |
| 覆盖度            | 25   |
| 可执行性          | 25   |
| 可移植性          | 25   |
| Agent 可触发      | 15   |
| 单一真源 / 可维护 | 10   |

## 维护

- 本仓已有 rule/skill ↔ 本目录：见 [SYNC.md](./SYNC.md)。
- 新增模块：更新本表 + SYNC「参考模块」。
- `glb-*` / 仅参考模块：不强制回写本仓 `.cursor`。
