# glb-book-to-skill — 书籍/文档 → Agent Skill 转换器

> **参考接入**：指导**本机或其他机器**安装配置 [virgiliojr94/book-to-skill](https://github.com/virgiliojr94/book-to-skill)，不是仓库运行时依赖。  
> **前缀 `glb-`**：见下方「级别判断」。不进本仓 `.cursor`，**不**要求与本仓 rule/skill 双向同步。

**类型**：全局 Agent Skill（转换器）+ 可选 Python 抽取依赖  
**上游**：https://github.com/virgiliojr94/book-to-skill（MIT）  
**站点**：https://booktoskill.is-a.dev/

## 级别判断（结论）

| 对象                                                           | 建议级别           | 落点                                                                                 | 理由                                                                              |
| -------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| **转换器本身** `book-to-skill`                                 | **全局（glb）**    | `~/.agents/skills/book-to-skill`（推荐）或 `~/.cursor/skills/` / `~/.claude/skills/` | 跨项目复用的元工具；官方默认也是用户级 skills                                     |
| **生成出的某本书 skill**（如 `designing-data-intensive-apps`） | **默认全局**       | `~/.agents/skills/<slug>/`                                                           | 个人学习/多仓共用；官方默认写用户级 cross-agent 目录                              |
| **生成出的某本书 skill**                                       | **项目级（例外）** | 仓内 `.agents/skills/<slug>/` 或 `.cursor/skills/<slug>/`                            | 仅当内容是**本仓/团队专属**（ADR、runbook、品牌规范、内部规格）且希望随仓库共享时 |

**对本仓 ku-utils 的建议**：装转换器用 `glb-*` 文档即可；**不要**把第三方版权书籍的生成 skill 提交进本仓库。若要把本仓 `docs/` 折成 skill，再单独做成项目级 skill，并走本仓 `SYNC.md` 同步约定。

```text
本机装转换器 ──► glb（~/.agents/skills/book-to-skill）
      │
      ▼
/book-to-skill ./book.pdf my-slug
      │
      ├─ 个人书 / 跨项目知识 ──► ~/.agents/skills/my-slug/     （仍属全局产出）
      └─ 团队内部文档       ──► <repo>/.agents/skills/my-slug/ （项目级产出）
```

## 项目做什么

把 PDF / EPUB / DOCX / HTML / Markdown 等转成**结构化** Agent Skill（框架、原则、技法、反模式 + 按需章节），而不是全书摘要塞进上下文。宣称相对「整书丢进 context」可少约 24×–51× token（见上游 performance 文档）。

生成物典型结构：

| 文件                                            | 作用                    |
| ----------------------------------------------- | ----------------------- |
| `SKILL.md`                                      | 核心心智模型 + 章节索引 |
| `chapters/chNN-*.md`                            | 按需加载的章节          |
| `glossary.md` / `patterns.md` / `cheatsheet.md` | 术语 / 模式 / 速查      |

流水线两段：本地 Python **extractor**（`scripts/extract.py`）→ Agent 按 `SKILL.md` 规格 **generate**。

## 推进接入分数

| 维度         | 分         | 说明                                    |
| ------------ | ---------- | --------------------------------------- |
| 覆盖度       | 18/25      | 多 Agent Skills 宿主；Cursor 走同一标准 |
| 可执行性     | 22/25      | `npx skills add` + 可选抽取依赖         |
| 可移植性     | 20/25      | 需 Python；技术书建议 Docling，体积较大 |
| Agent 可触发 | 14/15      | `/book-to-skill` 或描述触发             |
| 单一真源     | 9/10       | 上游仓库 + 本模块安装约定               |
| **合计**     | **83/100** |                                         |

## 最佳实践（精炼）

1. **转换器装全局**：`npx skills add virgiliojr94/book-to-skill`（或 `-g`）；Cursor 侧优先确认出现在 `~/.agents/skills/book-to-skill` 或 `~/.cursor/skills/`。
2. **先 `--check` 抽取依赖**：`python3 ~/.agents/skills/book-to-skill/scripts/extract.py --check`（路径以本机实际为准）。
3. **按书型选抽取器**：技术书（代码/表/公式）→ Docling；纯散文 → `pdftotext` / `pypdf`；扫描件先 OCR（如 `ocrmypdf`）。
4. **产出默认全局**；仅内部文档才写进仓库 skills，并注意版权（第三方书 skill **勿公开分发**）。
5. **更新已有 skill**：用官方 Update / Fold-in 模式，不要手改半截 chapters。
6. 处理在本地；上传到模型侧遵循你所用 Agent 云服务条款——转换器本身不上传文件到 book-to-skill 服务器。

## 本机落点（参考）

| 项                 | 路径 / 命令                                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 转换器 skill       | `~/.agents/skills/book-to-skill/`（或 Cursor 等价目录）                                                                                                             |
| 生成 skill（默认） | `~/.agents/skills/<slug>/`                                                                                                                                          |
| 健康检查           | `python3 …/scripts/extract.py --check`                                                                                                                              |
| 上游文档           | [Install](https://github.com/virgiliojr94/book-to-skill/blob/HEAD/docs/install.md) · [Usage](https://github.com/virgiliojr94/book-to-skill/blob/HEAD/docs/usage.md) |

## 验收清单

- [ ] Agent 能发现 `book-to-skill`（description / `/book-to-skill`）
- [ ] `extract.py --check` 对目标格式显示可用工具（或缺什么有明确安装命令）
- [ ] 对一份自有 PDF/MD 跑通一次转换，生成目录含 `SKILL.md` + `chapters/`
- [ ] 明确该次产出是全局还是项目级，且未误提交受版权保护的全书复述

## 相关

- 接入步骤：[INTEGRATION_PROMPT.md](./INTEGRATION_PROMPT.md)
- 同类 `glb-*`：[glb-lark](../glb-lark/) · [glb-chrome-debug-playwright](../glb-chrome-debug-playwright/)
