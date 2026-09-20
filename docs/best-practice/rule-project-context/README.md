# rule-project-context — 项目上下文（瘦身壳）

> **参考接入**：供本项目或其他项目接入 `.cursor/rules` 时参考，非运行时依赖。  
> **本仓同步**：与根 / kv3-admin 的 `project-context.mdc` **双向同步**（见 [SYNC.md](../SYNC.md)）。  
> **来源提炼**：jx-dsp / oversea-creative-web 巨石 context 的「反模式教训」→ 本模块只保留壳层义务。

**类型**：Cursor Rule（`.mdc`，`alwaysApply: true`）

## 设计原则：禁止巨石 context

| 反模式                                           | 正确做法                                                      |
| ------------------------------------------------ | ------------------------------------------------------------- |
| 单文件 300～600 行塞满列表/选择器/Mock/合同      | context **≤ ~120 行**；专题拆到独立 `rule-*` / `rule-skill-*` |
| 用「见某某外部仓」代替可执行条文                 | 条文**自包含**；外仓路径只作「关联仓储」变量表                |
| alwaysApply 塞全仓细节                           | alwaysApply 只放「每次对话都要」的身份/合同冻结/门禁/模块索引 |
| 跨产品抄信封码（`0`/`data` ↔ `'0000'`/`result`） | 合同冻结表写死本仓码；禁止兼容双轨                            |

## 推进接入分数

| 维度         | 分         | 说明                   |
| ------------ | ---------- | ---------------------- |
| 覆盖度       | 24/25      | 管理端仓普遍需要       |
| 可执行性     | 23/25      | 瘦身模板 + 索引可照抄  |
| 可移植性     | 22/25      | 壳层通用；合同表按仓填 |
| Agent 可触发 | 15/15      | `alwaysApply: true`    |
| 单一真源     | 9/10       | 与专题模块分工清晰     |
| **合计**     | **93/100** |                        |

## 最佳实践（精炼）

### 1. context 里只放这些

1. **身份**：一句话产品定位（单仓 / monorepo 哪几个 app）
2. **协作语言**：对话与 commit 中文（或链到 [rule-commit-message](../rule-commit-message/)）
3. **合同冻结表**（必填，按仓改值）：成功码、载荷字段、未登录码/跳转、ID 类型、禁止抄错项
4. **提交门禁**：改源码前须跑哪些命令（如 `pnpm typecheck && pnpm lint`）
5. **关联仓储**：环境变量名（禁止写死本机绝对路径；禁止业务 `import.meta.env` 读路径变量）
6. **模块索引表**：指向本仓已落地的专题 `.mdc` / skill（见下）
7. **全局禁令摘要**：禁 openspec、禁测入库、禁兼容层（细则在 [rule-agent-guardrails](../rule-agent-guardrails/)）

### 2. 必须拆出去的专题（按需接入）

| 主题                        | best-practice 模块                                               | 建议 alwaysApply / globs   |
| --------------------------- | ---------------------------------------------------------------- | -------------------------- |
| 目录与 Layer/_module        | [rule-project-structure](../rule-project-structure/)             | always 或 `src/modules/**` |
| 列表 / 筛选 / 操作列 / Cell | [rule-skill-admin-list-filter](../rule-skill-admin-list-filter/) | `**/*List.vue` 等          |
| 实体选择器                  | [rule-skill-entity-selector](../rule-skill-entity-selector/)     | `*Selector*.vue`           |
| Mock 隔离与种子             | [rule-mock-isolation](../rule-mock-isolation/)                   | `**/_mock/**`              |
| API / 字典 / 响应示例边界   | [rule-api-contract](../rule-api-contract/)                       | `_api` / `maps`            |
| 用户可见文案                | [rule-user-visible-copy](../rule-user-visible-copy/)             | 按需                       |
| 任务台账 / wait 队列        | [rule-task-ledger](../rule-task-ledger/)                         | 按需                       |
| 前后端文档增量              | [rule-fe-be-doc-sync](../rule-fe-be-doc-sync/)                   | 按需                       |
| Vue SFC / CSS               | [rule-vue-sfc-standards](../rule-vue-sfc-standards/)             | `*.vue`                    |
| 皮肤                        | [skill-theme-skin](../skill-theme-skin/)                         | skill                      |
| Hooks                       | [rule-skill-hooks-composables](../rule-skill-hooks-composables/) | skill+rule                 |
| 自定义列                    | [rule-skill-custom-columns](../rule-skill-custom-columns/)       | skill+rule                 |

拆分操作说明见 [_decomposition/README.md](../_decomposition/README.md)。

### 3. Monorepo

根 context（包地图、发版）+ 子应用 context（列表/合同）；子应用**不**重复根级包列表。

### 4. 禁止

- 密钥、内网账号、真实 Cookie 写入 context
- 把整本列表规范、选择器百科、Mock 细则堆进 alwaysApply

## 本仓落点

- [`.cursor/rules/project-context.mdc`](../../../.cursor/rules/project-context.mdc)
- [`apps/kv3-admin/.cursor/rules/project-context.mdc`](../../../apps/kv3-admin/.cursor/rules/project-context.mdc)（含专题 Rules 索引表）
- kv3-admin 已落地专题：`project-structure` / `mock-isolation` / `api-contract` / `entity-selector`(+skill) / `user-visible-copy` / `task-ledger`（精简）/ `custom-columns` / `filter-panel-demo`
- 同步机制：[`.cursor/rules/best-practice-sync.mdc`](../../../.cursor/rules/best-practice-sync.mdc)
- 对照表：[SYNC.md](../SYNC.md)（`rule-fe-be-doc-sync` 仍为参考，按需升格）

## 验收清单

- [ ] `project-context.mdc` 行数可控（建议 &lt; 150），且含「专题模块索引」
- [ ] 合同冻结表与业务拦截器一致，无双码兼容
- [ ] 列表/选择器/Mock 等已有独立 rule 或明确「本仓未接入」
- [ ] 无密钥明文
