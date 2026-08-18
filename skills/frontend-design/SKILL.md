---
name: frontend-design
description: 前端 UI 设计规范（团队定制版）
version: 1.0.0
tags: [design, ui, frontend]
---

# 前端 UI 设计规范

## 组件优先

1. 先检查 @ku-utils/ui 是否已有对应组件
2. 如无，考虑是否值得封装到 @ku-utils/ui
3. 业务专属组件放在项目内部

## CSS 规范

- 禁止使用 & 拼接类名（如 &-header, &\_\_content, &--active）
- &.modifier 形式（如 &.active, &.disabled）是允许的
- 类名使用完整的 BEM 风格但不嵌套：`.card-header` 而非 `&-header`

## 响应式

- 使用 @ku-utils/hooks 的 useBreakpoint
