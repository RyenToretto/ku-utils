# init 初始化配置

在**已有**项目根目录（需存在 `package.json`）下，交互式勾选要接入的 ku-utils 能力并写回依赖与配置文件。

## 使用

```bash
cd your-project
npx @ku-utils/cli init
```

## 可选能力

多选框中通常包含：

- ESLint、Prettier、TSConfig、Stylelint
- `@ku-utils/utils`、`@ku-utils/hooks`、`@ku-utils/ui`、`@ku-utils/request`

根据勾选结果，CLI 会向 `package.json` 合并对应 `dependencies` / `devDependencies` 并生成或更新配置文件（具体文件列表以工具实现为准）。

## 注意

请在仓库根目录执行；若未找到 `package.json` 会提示错误并退出。
