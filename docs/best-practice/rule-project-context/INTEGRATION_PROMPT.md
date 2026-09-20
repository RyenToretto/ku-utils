# 接入 Prompt：rule-project-context

> 本 Prompt 供 **本项目或其他项目** 参考接入用；落地目标以 `.cursor/rules` 为主。

请在本仓库落实「项目上下文」最佳实践（来源：ku-utils `docs/best-practice/rule-project-context`）。

## 目标

新增或改写 `.cursor/rules/project-context.mdc`，让 Agent 默认知道本仓结构与硬约束。

## 要求

1. 阅读仓库真实目录（packages/apps/src…），**不要照抄其他仓的包名**。
2. 文件 frontmatter：`description` 写清何时读取；仓级上下文可用 `alwaysApply: true`。
3. 正文用中文，至少包含：
   - 项目概要（一句话 + 技术栈）
   - 目录地图（树状即可）
   - 硬约束（编号列表，≤10 条）
   - 常用命令
   - 若有 Example/Demo 门控或发版流程，写明
4. 若是 monorepo 且存在独立 starter 应用：在应用目录再写一份更短的 `project-context.mdc`，只写应用约定，并链到根文档。
5. 禁止写入密钥、生产账号、内网 token。
6. 完成后用 3 个自测问题验证：目录、build 命令、一条硬约束；在回复里给出路径与摘要。

## 参考结构

```markdown
---
description: <仓名> 全局上下文。了解结构/命令/硬约束时读取。
globs:
alwaysApply: true
---

# <仓名> 全局上下文

## 项目概要

## 目录地图

## 硬约束

## 常用命令
```
