# 巨石 project-context 拆分指南

> 从 **jx-dsp**、**oversea-creative-web** 的实践提炼：把 alwaysApply 巨石拆成可复用模块，降低 token、便于 diff、便于他仓按需接入。

## 为什么拆

| 问题                      | 后果                                                        |
| ------------------------- | ----------------------------------------------------------- |
| 单文件 400～600 行        | 每次对话灌满上下文，贵且易淹没关键合同                      |
| 列表/选择器/Mock 耦在一起 | 改一行难 review；他仓只能「整抄或放弃」                     |
| 跨仓抄信封                | DSP `code===0`+`data` 与海外 `'0000'`+`result` 混用导致假绿 |

## 目标形态

```text
.cursor/rules/
├── project-context.mdc          # 瘦身壳 alwaysApply（身份/合同冻结/门禁/索引）
├── project-structure.mdc        # 目录 Layer/_module（建议 always 或 modules globs）
├── admin-list-filter.mdc        # 列表/筛选/Cell/操作列
├── entity-selector.mdc          # XxxSelector 金标
├── mock-isolation.mdc           # Mock
├── api-contract.mdc             # API/字典/响应示例
├── user-visible-copy.mdc        # 用户可见文案
├── task-ledger.mdc              # 任务台账（可选）
└── …vue-standards / commit …
.cursor/skills/
├── hooks/ / custom-columns/ / theme-skin/ / doc-backend-sync/ …
```

对应 best-practice 目录见 [README.md](../README.md) 模块地图「管理端模块化」一节。

## 迁移步骤（已有巨石仓）

1. **冻结合同表**：从旧 context 抽出成功码/载荷/登录码，写入新瘦身 context（最高优先）。
2. **剪切专题**：按上表把章节移到新 `.mdc`；旧位置改为一行链接「见 xxx.mdc」。
3. **选择器**：若正文含「必须用 XxxSelector」长表 → `entity-selector.mdc`；Demo 路由表可留 skill。
4. **Mock**：种子硬编码、信封、禁 import → `mock-isolation.mdc`（globs 绑 `_mock`）。
5. **列表**：四要素、筛选顺序、操作列、Cell* → `admin-list-filter.mdc`。
6. **结构**：Layer/_module/Dialog 命名 → `project-structure.mdc`。
7. **删重复**：context 与专题不得保留两份互相矛盾的细则。
8. **验收**：新开 Agent 对话能答对合同码；改一个 List 页时主要命中 list/selector rule 而非整本 context。

## 参考真源（只读对照，勿整文件复制）

| 仓                   | 路径                                                                    | 备注                                   |
| -------------------- | ----------------------------------------------------------------------- | -------------------------------------- |
| jx-dsp               | `.cursor/rules/project-context.mdc`                                     | 巨石完整版；选择器/waitRD/字段检查极全 |
| oversea-creative-web | `project-context` + `project-structure` + `selector` + `mock-isolation` | **拆分后范本**；信封与 DSP 不同        |

## 他仓接入顺序（绿场）

1. [rule-project-context](../rule-project-context/)
2. [rule-project-structure](../rule-project-structure/)
3. [rule-api-contract](../rule-api-contract/)（填本仓信封）
4. [rule-skill-admin-list-filter](../rule-skill-admin-list-filter/)
5. [rule-skill-entity-selector](../rule-skill-entity-selector/)
6. [rule-mock-isolation](../rule-mock-isolation/)
7. 其余按需：copy / task / fe-be / skin / hooks / columns
