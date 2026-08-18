# ku-utils

前端公共库 Monorepo。包以 `@ku-utils/*` 发布到 [npm](https://www.npmjs.com)，消费项目：

```bash
pnpm add @ku-utils/utils @ku-utils/hooks
pnpm add -D @ku-utils/eslint-config @ku-utils/tsconfig
```

## 技术栈

pnpm 10 + Turborepo 2 + Changesets。Node >= 20。

## 目录

- `packages/` 可发布库（utils、hooks、custom-columns、ui、report…）
- `tools/` `cli` / `create-app`
- `apps/kv3-admin` Vue 3 + Element Plus 管理端 starter
- `apps/playground-*` 包级联调
- `docs/` VitePress

## 开发

```bash
pnpm install
pnpm build
pnpm test
pnpm dev:admin    # starter
pnpm start        # 文档站
```

本仓 apps 通过 `workspace:*` 引用尚未发布的包。

## 发版

```bash
pnpm changeset
```

合入 `main` 后，GitHub Actions 会打开 Version Packages PR；合并后自动 `changeset publish` 到 npm，并打 `@ku-utils/<name>@<version>` tag。

本地：`pnpm release && git push --follow-tags`。

需要 npm organization `ku-utils` 与仓库 Secrets `NPM_TOKEN`。详见 [docs/npm-publish.md](./docs/npm-publish.md)。

## License

MIT
