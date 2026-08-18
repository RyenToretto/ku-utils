---
name: frontend-design
description: 前端 UI 设计规范（团队定制版）
version: 1.0.0
tags: [design, ui, frontend]
---

# 前端 UI 设计规范

## 设计令牌

使用 @ku-utils/design-tokens 中定义的设计令牌，不要硬编码颜色、间距等值。

```css
/* 正确 */
.card {
  color: var(--du-neutral-800);
  padding: var(--du-spacing-4);
}

/* 错误 */
.card {
  color: #262626;
  padding: 1rem;
}
```

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
- 断点参考 design-tokens 中的定义
