# CLI 概览

团队提供两条命令行入口：

| 包名                   | 命令                                               | 说明                   |
| ---------------------- | -------------------------------------------------- | ---------------------- |
| `@ku-utils/create-app` | `npx @ku-utils/create-app [dir]`                   | 交互式创建标准工程     |
| `@ku-utils/cli`        | `npx ku-utils <command>`（或 `npx @ku-utils/cli`） | 创建、初始化、健康检查 |

## 安装（全局可选）

```bash
pnpm add -g @ku-utils/cli
ku-utils --help
```

## 子命令

- `create <name>`：在指定目录生成项目骨架与基础配置
- `init`：在现有仓库中勾选并写入 ESLint / Prettier / TSConfig 等
- `doctor`：检查 `package.json` 依赖与关键配置文件是否存在

详见各子命令文档页。
