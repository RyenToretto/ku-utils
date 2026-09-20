# 接入 Prompt：glb-book-to-skill

> 本 Prompt 供 **本机或其他机器** 安装配置 [book-to-skill](https://github.com/virgiliojr94/book-to-skill) 用。  
> 来源：ku-utils `docs/best-practice/glb-book-to-skill`。  
> **级别**：转换器 → **全局**；生成 skill → **默认全局**，仅团队内部文档才进**项目** skills（见 README「级别判断」）。

请落实 book-to-skill 转换器安装与一次冒烟转换。不要把第三方版权书籍的生成 skill 推到公开仓库。

## 目标

1. **安装转换器（全局，推荐）**：

```bash
npx skills add virgiliojr94/book-to-skill
# 若本机 skills CLI 支持全局显式参数，可用：
# npx skills add virgiliojr94/book-to-skill -g -y
```

备选（手动）：

```bash
git clone https://github.com/virgiliojr94/book-to-skill.git ~/.agents/skills/book-to-skill
# Claude Code 常用：~/.claude/skills/book-to-skill
# Cursor 若只扫 ~/.cursor/skills，可再拷贝或软链一份到该目录
```

2. **确认 Agent 能发现 skill**：新开对话，确认存在 name=`book-to-skill` 的 skill（或可调用 `/book-to-skill`）。

3. **检查抽取依赖**（路径按实际安装位置改）：

```bash
python3 ~/.agents/skills/book-to-skill/scripts/extract.py --check
```

按输出补齐缺失工具，常见：

| 场景                     | 建议                                          |
| ------------------------ | --------------------------------------------- |
| 技术 PDF（代码/表/公式） | `pip3 install docling`                        |
| 散文 PDF                 | `pdftotext`（poppler）或 `pip3 install pypdf` |
| EPUB                     | `pip3 install ebooklib beautifulsoup4`        |
| DOCX                     | `pip3 install python-docx`                    |
| 扫描件                   | 先 `ocrmypdf input.pdf output.pdf` 再转换     |

4. **冒烟转换**（仅用你有权使用的文件；可先用自有 Markdown）：

在 Agent 中执行等价于：

```text
/book-to-skill /path/to/your-doc.md demo-book-skill
```

或让 Agent 按 skill 步骤：选 content type（technical / text-heavy）→ extract → generate。

5. **选定产出目录并告知用户**：

- 默认：`~/.agents/skills/demo-book-skill/`（**全局产出**）
- 若用户明确要进当前仓库：写入 `.agents/skills/<slug>/` 或 `.cursor/skills/<slug>/`（**项目产出**），并提醒是否需要 gitignore / 版权审查后再提交。

6. **版权与隐私提醒（必须口头确认）**：

- 工具本地抽取；不把文件上传到 book-to-skill 服务。
- 生成 skill 视为「结构化笔记」，**不要公开分发**受版权保护的第三方书 skill。
- 公司内部文档分享范围遵循公司规定。

## 不要做

- 不要把转换器当成本业务仓的 npm 依赖去 `pnpm add`。
- 不要默认把生成 skill 提交进 ku-utils（除非用户明确要求且内容为仓内自有文档）。
- 不要跳过扫描 PDF 的 OCR 提示硬跑空抽取。

## 完成后

给出：转换器安装路径、`extract.py --check` 摘要、冒烟生成目录、以及本次产出判定为 **全局** 还是 **项目级**。
