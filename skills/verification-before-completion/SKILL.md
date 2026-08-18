---
name: verification-before-completion
description: 完成前验证清单
version: 1.0.0
tags: [quality, workflow]
---

# 完成前验证

在声称任务完成之前，必须执行以下验证：

## 代码质量

- [ ] `pnpm lint` 无错误
- [ ] `pnpm typecheck` 无类型错误
- [ ] `pnpm build` 构建成功

## 测试

- [ ] `pnpm test` 所有测试通过
- [ ] 新增功能有对应测试

## 文档

- [ ] README.md 已更新（如有 API 变更）
- [ ] 类型定义完整且导出

## 变更记录

- [ ] 已执行 `pnpm changeset` 创建变更记录

## 兼容性

- [ ] 确认在 Vue 2 / Vue 3 / Nuxt 4 中均可用（如适用）
- [ ] ESM 和 CJS 双格式输出正常
