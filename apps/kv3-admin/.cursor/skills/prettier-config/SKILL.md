---
name: prettier-config
description: 为项目配置 @ku-utils/prettier-config 统一代码格式化。当初始化新项目 Prettier 时使用。
---

# @ku-utils/prettier-config Skill

团队统一 Prettier 格式化配置（单引号、100列宽、trailing comma 等）。

## 安装

```bash
npm install -D @ku-utils/prettier-config prettier
```

## 配置

```json
// package.json — 推荐方式
{
  "prettier": "@ku-utils/prettier-config",
  "scripts": {
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,vue,json,md,css,scss}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,vue,json,md,css,scss}\""
  }
}
```

## 配置规则预览

```js
// @ku-utils/prettier-config 的内容（仅供参考，不要手动复制）
{
  singleQuote: true,      // 单引号
  semi: false,            // 无分号（或 true，取决于团队约定）
  printWidth: 100,        // 100列换行
  trailingComma: 'all',   // 尾逗号
  tabWidth: 2,            // 2空格缩进
  arrowParens: 'always',  // 箭头函数参数括号
}
```

## Editor 集成（VS Code）

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[typescript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[vue]": { "editor.defaultFormatter": "esbenp.prettier-vscode" }
}
```

## CI 格式化检查

```yaml
# .github/workflows/ci.yml
- name: Check formatting
  run: pnpm format:check
```
