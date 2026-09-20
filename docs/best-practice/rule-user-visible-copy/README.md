# rule-user-visible-copy — 用户可见文案

> **已落地**：`apps/kv3-admin/.cursor/rules/user-visible-copy.mdc`  
> **来源**：jx-dsp / oversea `user-visible-copy.mdc`。  
> **同步**：改本模块或 `.mdc` 须双向更新，见 [SYNC.md](../SYNC.md)。

**类型**：Cursor Rule（`.mdc`）

## 本仓落点

| 路径                                                 | 说明                        |
| ---------------------------------------------------- | --------------------------- |
| `apps/kv3-admin/.cursor/rules/user-visible-copy.mdc` | Toast/校验/空态禁开发态泄漏 |

## 推进接入分数

| 维度         | 分         | 说明                       |
| ------------ | ---------- | -------------------------- |
| 覆盖度       | 20/25      | 两仓强制                   |
| 可执行性     | 24/25      | sink 表清晰                |
| 可移植性     | 23/25      | 几乎零业务耦合             |
| Agent 可触发 | 12/15      | 宜配 description           |
| 单一真源     | 9/10       | 独立 rule 优于埋在 context |
| **合计**     | **88/100** |                            |

## 最佳实践（精炼）

### 用户可见 sink

Toast / 空态 / 表单 label·placeholder·tip·校验 message / Dialog 正文 / Mock 公开 `message`·`label` / 拦截器展示的后端 `message`。有 i18n 的仓走 i18n。

### 禁止出现在 sink

| 类别       | 禁止示例                           | 正确                                        |
| ---------- | ---------------------------------- | ------------------------------------------- |
| 协作过程态 | 待后端确认、合同待确认、语义未冻结 | 开 wait/台账；UI 只写已确认产品句或省略 tip |
| 排期过程态 | 一期写死、二期骨架、phase 1        | 写当前产品行为                              |
| 开发编号   | Mock、waitRD、P51-xx、§6           | 仅注释/任务文档                             |
| 内部实现   | 包名/类名、堆栈、技术 detail       | 产品化失败句                                |

**允许**：产品化操作说明；JSDoc / 任务文档内的过程态用语。

### 表单校验文案

禁 `el-form-item` 布尔 `required` 触发英文默认句；rules 的 `required: true` 必须带中文（或 i18n）`message`。

## 验收清单

- [ ] 抽查 tip/Toast 无「待后端」「一期」等
- [ ] 校验失败为产品化中文/i18n
