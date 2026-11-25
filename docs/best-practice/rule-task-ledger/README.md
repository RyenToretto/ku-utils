# rule-task-ledger — 任务台账与确认队列

> **已落地（精简）**：`apps/{kv3,kv2,kr,ka}-admin/.cursor/rules/task-ledger.mdc` + 各自 `docs/task/TASK.md`（四端同文，仅 app 名不同）  
> **来源**：jx-dsp / oversea 台账；**xh-ai 2026-11 修订**：wait 队列统一为 waitConfirm、开新台账前清理满 30 天已收口档案。  
> **同步**：改本模块或 `.mdc` 须双向更新，见 [SYNC.md](../SYNC.md)。  
> **说明**：库仓/starter 可不强制启用 waitConfirm；完整版流程以本文为准，业务交付仓可升格。

**类型**：Cursor Rule（`.mdc`）+ 可选 Skill（上游同步 / 台账清理脚本）

## 本仓落点

| 路径                                                                  | 说明                                                                                             |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `apps/kv3-admin/.cursor/rules/task-ledger.mdc`                        | 精简：先登记再编码 + emoji + 开账前清理                                                          |
| `apps/kv3-admin/docs/task/TASK.md`                                    | 活跃看板（按人→按状态）                                                                          |
| `apps/{kv2,kr,ka}-admin/.cursor/rules/task-ledger.mdc` + `docs/task/` | 四生同名；ka/kr 可有主题台账文件                                                                 |
| `scripts/check-task-ledger-cleanup.mjs`                               | 开新台账前 / 巡检：列出可删的已收口台账（≥30 天）                                                |
| 业务仓范本（xh-ai 等）                                                | `{owner}{seq}-{slug}` + `docs/waitConfirm/<owner>/` + `taskledger:cleanup` / `waitconfirm:ready` |

## 推进接入分数

| 维度         | 分         | 说明                   |
| ------------ | ---------- | ---------------------- |
| 覆盖度       | 19/25      | 重交付仓强；库仓可选用 |
| 可执行性     | 23/25      | 触发时机 + 清理脚本    |
| 可移植性     | 17/25      | 目录名可改，流程通用   |
| Agent 可触发 | 13/15      | 「实现/修复」触发      |
| 单一真源     | 8/10       | 与 fe-be-doc-sync 协作 |
| **合计**     | **80/100** |                        |

## 最佳实践（精炼）

### 强制触发

用户说「实现 / 开发 / 优化 / 修复」等 → **先**建 `docs/task/{id}.md`（活跃则登记 `TASK.md`），**再**编码。  
一次任务一次 commit；收工更新 `{id}.md` 并从活跃索引移除。  
Commit：`type(<app>): 中文摘要`，scope 用 app / 包名（受 commitlint `scope-enum` 约束），**不**把任务 ID 当 scope；任务 ID `{id}[-nn]` 写进 subject 末尾括号或 body。

### 开新台账前 · 本人台账清理（强制）

取新 `{owner}{seq}-{slug}` **之前**，先对本 owner 跑清理检查：

```bash
# 本 monorepo：扫全部 apps/*/docs/task，或限定 app
node scripts/check-task-ledger-cleanup.mjs
node scripts/check-task-ledger-cleanup.mjs --app ka-admin --owner koujianfeng
# 业务仓常见别名：npm run taskledger:cleanup -- --owner <owner>
```

| 可删条件（须同时满足）                | 说明                                         |
| ------------------------------------- | -------------------------------------------- |
| `{owner}{seq}-{slug}.md`              | **禁止**删 `TASK.md`、历史 `Pxx-*.md`        |
| 文件内无 `⭕️` / `⚠️` / `⛔️`           | 仅剩 `✅` / `❎`                             |
| 不在 `TASK.md` 活跃板 ⭕️/⚠️/⛔️ 表     | 「已收口」说明链接不算活跃                   |
| 距该文件最近一次 git 提交 ≥ **30 天** | `git log -1 --format=%ct`                    |
| 非「主题续作强制」现行文件            | 续作主题默认保留，除非用户结案并从续作表移除 |

有可删项 → 先删文件并清 `TASK.md` 链接，再开新台账。无可删 → 回复注明「台账清理：无满 30 天可删项」。

### 任务 ID（多人防冲突 · 强制）

| 规则       | 说明                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| **新任务** | `{owner}{seq}-{slug}`（例：`koujianfeng1-use-now`）。**禁止**只写 `koujianfeng1`                                           |
| `owner`    | `git config user.name` 规范化（小写、仅 `[a-z0-9]`）；也可用 GitHub login                                                  |
| `seq`      | 扫 `docs/task/{owner}{数字}-*.md`，取 owner 后、第一个 `-` 前的数字，最大号 + 1（`koujianfeng10-…` 大于 `koujianfeng1-…`） |
| `slug`     | 英文 kebab，2～4 个词，看文件名就知道做什么；禁止空 slug、禁止中文                                                         |
| **禁止**   | 全局 `Pnn` / `Pnn-<slug>.md` / `Pxx` 等不符形式；**禁止** `{owner}{seq}.md`（无 slug）                                     |
| **历史**   | 已有 `Pxx-*` 或无 slug 文件只读保留；继续收口改原文件，不要改号迁名                                                        |

子任务行号：`{id}-01`、`{id}-02`（id 已含 slug）。

### `TASK.md`：按人 → 按状态（降冲突 + 防膨胀）

| 真源      | 职责                                   |
| --------- | -------------------------------------- |
| `{id}.md` | **全量档案**，历史保留（可按上节清理） |
| `TASK.md` | **仅活跃**；`## {owner}` → `### ⭕️     | ⚠️  | ⛔️` |

```markdown
## koujianfeng

### ⭕️ 待实现

| ID                        | 标题 | 路径                           |
| ------------------------- | ---- | ------------------------------ |
| koujianfeng1-batch-select | …    | ./koujianfeng1-batch-select.md |

### ⚠️ 部分完成

…

### ⛔️ 阻塞

…
```

- **只改自己的 `## {owner}`**；没有则在**文件末尾**新建整节（勿插进别人中间）
- 状态变更 = 在本人节内把行剪到对应子节；`✅`/`❎` → 写 `{id}.md` 后 **删行出看板**
- 禁止改别人的节、禁止全局重排、禁止把索引当编年史
- 合并：冲突面缩到「同一人 + 同一状态表」；保留双方新增行；偶发同 ID 则后提交者改 `seq`

### 状态符号（禁止 `- [ ]`）

| 符号 | 含义                                                  |
| ---- | ----------------------------------------------------- |
| `✅` | 已完成（本仓义务已落地）                              |
| `⚠️` | 部分完成                                              |
| `⭕️` | 待实现（本仓 FE 待办）                                |
| `⛔️` | 阻塞（须附原因与方案；仍属本仓义务）                  |
| `❎` | 确认先不做 / **FE 不跟**（纯 BE、等供给、产品未拍板） |

**分流**：纯后端/等字典 → `❎`，禁止用 `⛔️` 冒充本仓阻塞。重启 `❎` 须用户改回 `⛔️`/`⭕️`。

### 确认队列（统一 waitConfirm · 业务仓升格）

**不再分 waitRD / waitConfirm 双目录。** 产品拍板与接口合同一律进：

```text
docs/waitConfirm/
  README.md
  manifest.json
  <owner>/          # 提交人 = 台账 owner（小写 [a-z0-9]+）
    topic.md
```

| 约定   | 说明                                                                                                        |
| ------ | ----------------------------------------------------------------------------------------------------------- |
| 收件   | 整份 markdown 转发给**服务端**；对方再判断是否找 PM / 运营                                                  |
| 文首   | **禁止**写「收件人：…」                                                                                     |
| 回复栏 | 产品/范围 →「精确决策」七项；接口合同 →「精确合同」九项；同文件勿混用                                       |
| 格式   | `## QA-{id}：` + 紧跟 `### QA-{id} 回复`，组间 `---`；登记 `manifest.json` 的 `file` 为 `<owner>/<name>.md` |
| 未确认 | 合同类：**网络前 0 请求**；产品类：不臆造结论；台账 `⛔️`/`❎`                                               |
| 门禁   | 业务仓常见 `npm run waitconfirm:ready`（空队列或全已回复 → exit 0）                                         |

已确认必须消费后删除 QA 并更新 manifest，禁长期滞留。库仓可不落地 wait 目录。

### 上游文档增量（Skill）

合同仓有新 commit → 侦测快照 → **先** `taskledger:cleanup` → 开 `{owner}{seq}-{slug}` → 逐条实现+CDP+commit。见 [rule-fe-be-doc-sync](../rule-fe-be-doc-sync/) 与 glb chrome-debug。开账**禁止** `Pnn`，**禁止**无 slug。

### create/update 字段检查（可选加强）

大表单收口前：合同字段检查表 + 浏览器验收新建/编辑/拷贝与联动（脚本仅 `.playwright-mcp/`）。

## 验收清单

- [ ] 「实现」类请求会先建 `{id}.md`
- [ ] 开新台账前会跑清理（满 30 天已收口可删）
- [ ] ID 为 `{owner}{seq}-{slug}`，取号扫 `{owner}{数字}-*.md`，无全局 `Pxx`、无「仅序号」文件名
- [ ] `TASK.md` 按人→按状态分节，且仅活跃项；`✅`/`❎` 出索引、文件留档（可清理）
- [ ] 状态只用约定 emoji
- [ ] FE/BE 边界不被 `⛔️` 误阻塞
- [ ] 若启用确认队列：仅 `docs/waitConfirm/<owner>/`，无 waitRD 双目录
