# 盘点摘要（Inventory）

> 本文件仅作来源说明。可接入的最佳实践在上级目录的 `rule-*` / `skill-*` / `rule-skill-*` 中，供 **本项目或其他项目参考接入**。

扫描范围：本机全局 Cursor/Agent 配置 + `/Users/koujianfeng/Desktop/kjf` 下项目（排除 `node_modules` / `.git` / `dist`）。日期：2026-09-20。

## 本机全局

| 位置                      | 状态                                          |
| ------------------------- | --------------------------------------------- |
| `~/.cursor/rules`         | 空                                            |
| `~/.cursor/skills`        | `chrome-debug-playwright`                     |
| `~/.agents/skills`        | 28× 飞书 `lark-*`（产品能力，非工程 BP）      |
| `~/.cursor/skills-cursor` | Cursor 产品技能（create-rule/skill、review…） |
| plugins cache             | superpowers / figma / notion 等               |

## kjf 项目侧

- 含 `.cursor` 的项目约 **28** 个（含 monorepo 子应用如 `kv3-admin`）。
- 高频 **rule**：`project-context`、`hooks-guide`、`custom-columns-*-pattern`、`vue-standards`、`user-visible-copy`、`mock-isolation`…
- 高频 **skill**：`custom-columns`、`hooks`、`utils`、`eslint-config`、`prettier-config`、`theme-skin`…

## 重复与归纳

同一主题在多仓复制。已合并为 10 个可参考接入模块（见 [../README.md](../README.md)），以 ku-utils / kv3-admin / 管理端范式为主真源。

## 未纳入可接入模块的类别

飞书 `lark-*`、Cursor 产品元技能、网文写作、万足世界观、单仓测试账号等。
