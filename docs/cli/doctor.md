# doctor 健康检查

扫描当前目录项目是否已接入核心工程化包与关键配置文件，并在终端输出通过 / 警告 / 失败状态。

## 使用

```bash
cd your-project
npx @ku-utils/cli doctor
```

## 检查项（示例）

典型检查包括：

- 是否安装 `@ku-utils/eslint-config`、`@ku-utils/prettier-config`、`@ku-utils/tsconfig`
- 是否存在 `eslint.config.js` 或 `eslint.config.mjs`
- 其他与团队规范相关的文件或脚本（以 CLI 输出为准）

用于迁移验收或 CI 前的本地自检。
