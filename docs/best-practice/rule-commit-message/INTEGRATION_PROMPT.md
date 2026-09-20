# 接入 Prompt：rule-commit-message

> 本 Prompt 供 **本项目或其他项目** 参考接入用；落地目标以 `.cursor/rules` 为主。

请在本仓库落实 Git Commit Message 最佳实践（来源：ku-utils `docs/best-practice/rule-commit-message`）。

## 目标

1. 添加 `.cursor/rules/commit-message.mdc`（中文规范 + type/scope 表 + 示例）。
2. 若仓库尚无约定：接入 `@commitlint/config-conventional` 的变体或现有团队 config，确保 **subject 中文** 可被校验（可参考 ku-utils 的 commitlint）。
3. 若已有 husky：在 commit-msg hook 跑 commitlint；不要在未征得同意时强行改 CI。

## 规则正文必须包含

- 格式：`type(scope): 中文描述`
- type 列表与含义
- scope 约定（按本仓包名/目录列出）
- 至少 3 个正确示例、1 个错误示例（英文 subject）
- **禁止** `Co-authored-by: Cursor <cursoragent@cursor.com>` 等 AI 署名 trailer；建议用 commitlint 自定义规则硬拦

## 约束

- 不要修改用户的 git config。
- 不要在本次任务中主动 `git commit`，除非用户另行要求。
- 完成后列出改动文件路径。
