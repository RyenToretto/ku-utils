# rule-vue-sfc-standards — Vue SFC / CSS

> **参考接入**：供本项目或其他项目接入 `.cursor/rules` 时参考，非运行时依赖。  
> **本仓同步**：与 [`.cursor/rules/vue-standards.mdc`](../../../.cursor/rules/vue-standards.mdc) **双向同步**（见 [SYNC.md](../SYNC.md)）。

**类型**：Cursor Rule（`.mdc`）

Vue 3 `<script setup>`、块顺序、CSS 类名拼接禁令、优先复用共享包。

## 推进接入分数

| 维度         | 分         | 说明                            |
| ------------ | ---------- | ------------------------------- |
| 覆盖度       | 22/25      | 多仓 vue-standards / ui-guide   |
| 可执行性     | 24/25      | ESLint `vue/block-order` 可强制 |
| 可移植性     | 22/25      | Vue2 仓需降级说明               |
| Agent 可触发 | 13/15      | globs 绑 `*.vue`                |
| 单一真源     | 9/10       | 本仓 rule 完整                  |
| **合计**     | **90/100** |                                 |

## 最佳实践（精炼）

1. 块顺序：`<template>` → `<script>` → `<style>`。
2. Vue 3：`<script setup lang="ts">`；`defineProps` / `defineEmits` 类型声明；`defineOptions({ name })`。
3. CSS：**禁止** `&-suffix` / `&__elem` 类名拼接；允许 `&.modifier`。
4. 主题色用设计 token（本生态为 `--ku-*`），packages 内写 `var(--ku-*, <tome 浅色 fallback>)`。
5. 工具函数优先共享库（如 `@ku-utils/utils`），禁止重复造 debounce 等。

## 本仓落点

- [`.cursor/rules/vue-standards.mdc`](../../../.cursor/rules/vue-standards.mdc)

## 验收清单

- [ ] 故意 `&-item` 写法可被 lint 或 code review 指出
- [ ] 新 SFC 块顺序正确
