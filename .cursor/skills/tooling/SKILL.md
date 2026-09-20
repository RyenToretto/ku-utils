---
name: tooling
description: >-
  配置或排查 @ku-utils/eslint-config、prettier-config、tsconfig（Flat Config、
  base/library 分层、pnpm strict 显式依赖）。初始化工程配置或修 lint/typecheck 时使用。
---

# 工程配置 Skill（ESLint / Prettier / tsconfig）

真源包：

| 包                          | 路径                       |
| --------------------------- | -------------------------- |
| `@ku-utils/eslint-config`   | `packages/eslint-config`   |
| `@ku-utils/prettier-config` | `packages/prettier-config` |
| `@ku-utils/tsconfig`        | `packages/tsconfig`        |

## ESLint 9 Flat Config

- 预设：`base` / `vue2` / `vue3` / `nuxt4`（按项目选）
- 根 `eslint.config.js`：本仓用 vue3 并关闭 `vue/block-lang`（兼容 Vue2 包）
- **stylistic（semi/indent 等）交给 Prettier**，勿与 ESLint 重复开战

## tsconfig 分层

- `base.json`：`noEmit: true`（apps 防冗余产物）
- `library.json`：覆盖 `noEmit: false` + `declaration: true`（供 tsup/Vite 出类型）

## Prettier

- 共享 `@ku-utils/prettier-config`
- lint-staged：`eslint --fix` → `prettier --write`

## pnpm strict

`shamefully-hoist=false`：消费方必须**显式**声明依赖（含根目录 lint-staged 用的 eslint-config）。

## 改配置时

1. 改对应 `packages/*-config`，勿在 apps 复制一份长期分叉
2. `pnpm --filter @ku-utils/<pkg> build`（若该包需构建）
3. 根目录跑 `pnpm lint` / `pnpm typecheck` 冒烟

最佳实践：`docs/best-practice/skill-tooling-eslint-prettier-ts/`。
