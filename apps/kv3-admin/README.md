# @ku-utils/kv3-admin

Vue 3 + Vite + Element Plus 管理端 starter。在本 monorepo 内以 `workspace:*` 消费 `@ku-utils/utils`、`@ku-utils/hooks`、`@ku-utils/custom-columns`。

## 开发

在仓库根目录：

```bash
pnpm install
pnpm dev:admin
```

默认 Mock + Example（`VITE_USE_MOCK=true`，`VITE_APP_USE_EXAMPLE=1`），开发服默认 **5173**；端口被占用时 Vite 会自动顺延（5174…），打开后进入 `/example` Demo。

## 约定真源

- 列表页范式：[`docs/admin-list-page-pattern.md`](./docs/admin-list-page-pattern.md)
- Cursor：`.cursor/rules`（列表页约定 + custom-columns）与 `.cursor/skills/custom-columns`
- 样板代码：`src/modules/_example/`（`simpleExample` / `customColumns` / `schoolResource` 等）

后续可用本目录作为新后台项目的 starter（拷贝后把 `workspace:*` 换成 npm 上的 `@ku-utils/*` 版本）。`create-ku-utils-app` 完整拷贝本模板不在本期。
