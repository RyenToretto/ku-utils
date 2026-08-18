# @ku-utils/stylelint-config

> Stylelint CSS / SCSS 共享配置。

## 安装

```bash
pnpm add -D @ku-utils/stylelint-config stylelint
```

## 使用

CSS 项目 — `.stylelintrc`：

```json
{
  "extends": "@ku-utils/stylelint-config"
}
```

SCSS 项目：

```json
{
  "extends": "@ku-utils/stylelint-config/scss"
}
```

## 安装源

发布于 npmjs.org，直接 `pnpm add` 即可。

## AI Skill

安装后自动同步至 `.cursor/skills/stylelint-config/SKILL.md`，在 Cursor 对话中可按需调用：

> 为项目配置 @ku-utils/stylelint-config CSS/SCSS 规范（禁止 & 拼接类名）。当初始化项目 Stylelint 或遇到样式 lint 报错时使用。

---

详细文档请参考 [ku-utils 文档站](../../docs/)
