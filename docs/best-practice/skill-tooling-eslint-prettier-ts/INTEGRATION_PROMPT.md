# 接入 Prompt：skill-tooling-eslint-prettier-ts

> 本 Prompt 供 **本项目或其他项目** 参考接入用；落地目标以 `.cursor/skills` 为主。

请在本仓库落实 ESLint / Prettier / tsconfig 共享最佳实践（来源：ku-utils `docs/best-practice/skill-tooling-eslint-prettier-ts`）。

## 目标

1. 盘点当前 eslint/prettier/tsconfig 是「根内联」还是「共享包」。
2. 优先方案：依赖 `@ku-utils/eslint-config`、`@ku-utils/prettier-config`、`@ku-utils/tsconfig`（若网络/权限不足，则文档化「本地 extends」等价结构）。
3. 添加或更新 `.cursor/skills/` 下 `eslint-config`、`prettier-config`、`tsconfig`（可精简合并为一个 `tooling` skill，但 description 要覆盖三者关键词）。
4. 确认 pnpm 未 shamefully-hoist 时，根 lint 脚本所需依赖均已声明。
5. **不要**在未同意时升级大版本 ESLint/TS；只给建议。

## 完成后

给出配置入口文件路径、skill 路径、以及与 Prettier 冲突项是否已清除。
