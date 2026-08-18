# create 创建项目

通过 `@ku-utils/create-app` 或 `@ku-utils/cli create` 生成带团队预设依赖与 `eslint.config.js` 的新项目。

## 使用

```bash
npx @ku-utils/create-app my-app
```

或：

```bash
npx @ku-utils/cli create my-app
```

## 行为说明

1. 提示选择模板：**Vue 3 + TypeScript + Vite**、**Vue 2 + JavaScript + Vite** 或 **Nuxt 4**。
2. 在 `my-app` 目录创建 `package.json`、安装脚本占位及对应 ESLint 扁平配置片段等（以 CLI 当前实现为准）。

创建完成后进入目录执行 `pnpm install`（或所选包管理器）拉取依赖。
