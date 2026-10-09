# skill-tooling-eslint-prettier-ts — 工程配置共享

> **参考接入**：供本项目或其他项目接入 `.cursor/skills` 时参考，非运行时依赖。  
> **本仓同步**：与 [`.cursor/skills/tooling/SKILL.md`](../../../.cursor/skills/tooling/SKILL.md) **双向同步**（见 [SYNC.md](../SYNC.md)）。

**类型**：Cursor Skill（`SKILL.md`）

ESLint Flat Config、Prettier、tsconfig 分层；pnpm strict 下显式依赖。

## 推进接入分数

| 维度         | 分         | 说明                                 |
| ------------ | ---------- | ------------------------------------ |
| 覆盖度       | 22/25      | eslint/prettier/tsconfig skills 多仓 |
| 可执行性     | 23/25      | 本仓有可发布 config 包               |
| 可移植性     | 22/25      | 可 npm 消费 `@ku-utils/*-config`     |
| Agent 可触发 | 14/15      | 独立 skills                          |
| 单一真源     | 9/10       | packages 内真源清晰                  |
| **合计**     | **90/100** |                                      |

## 最佳实践（精炼）

1. ESLint 9 Flat Config；`base` / `vue2` / `vue3` / `nuxt4` / `angular` 分文件（React 直接用 `base`）；与 Prettier 冲突的 stylistic 交给 Prettier；根 `eslint.config.js` 用 vue3 并关闭 `vue/block-lang`（兼容 Vue 2）。
2. tsconfig：`base`（apps `noEmit: true`）与 `library`（发声明）分离；框架预设 `vue2` / `vue3` / `nuxt4` / `react` / `angular`；`paths` 用 `./` 相对路径、不写已废弃的 `baseUrl`。
3. 共享配置发成包（`@ku-utils/eslint-config` 等），消费方显式依赖（`shamefully-hoist=false`）；跑 `tsc` / `vue-tsc` 的 app 显式声明 `typescript`，避免 peer 解析到别的 workspace 的 TS 版本。
4. 三类 config 合并为一个 tooling skill：何时改、如何扩展 overrides、改完如何冒烟。
5. 根目录 lint-staged：eslint --fix → prettier --write。

## 本仓落点

- `packages/eslint-config` / `prettier-config` / `tsconfig`
- [`.cursor/skills/tooling/SKILL.md`](../../../.cursor/skills/tooling/SKILL.md)

## 验收清单

- [ ] `pnpm lint` / `typecheck` 有统一入口
- [ ] apps 不产生多余 `.d.ts`（若采用 noEmit 策略）
