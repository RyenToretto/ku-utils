---
name: design-tokens
description: 使用 @ku-utils/design-tokens 中的颜色/排版/间距/效果设计令牌。当需要在样式中引用品牌色、间距规范、阴影、圆角等时使用。
---

# @ku-utils/design-tokens Skill

设计令牌（Design Tokens），提供 CSS Custom Properties、SCSS 变量、JS 对象三种使用方式。

> **重要**：CSS 变量前缀是 `--du-`（不是 `--do-`），颜色分类是 `primary/success/warning/danger/neutral`（无 `gray`/`error`），排版用 camelCase（`--du-fontSize-base`，不是 `--du-font-size-base`）。

## 安装

```bash
npm install @ku-utils/design-tokens
```

---

## 接入方式

### 方式一：CSS Custom Properties（推荐）

```ts
// main.ts（或 Nuxt 通过 @ku-utils/nuxt-module 自动引入）
import '@ku-utils/design-tokens/css';
```

```css
/* 直接在 CSS/SCSS/Vue style 中使用 */
.button {
  background-color: var(--du-color-primary);
  color: var(--du-color-bg-primary);
  padding: var(--du-spacing-2) var(--du-spacing-4);
  border-radius: var(--du-radius-md);
  box-shadow: var(--du-shadow-sm);
}
```

### 方式二：SCSS 变量

```scss
@use '@ku-utils/design-tokens/scss' as tokens;

.button {
  background: tokens.$color-primary;
  padding: tokens.$spacing-2 tokens.$spacing-4;
}
```

### 方式三：JS 对象

```ts
import { colors, spacing, typography, effects } from '@ku-utils/design-tokens';

// 颜色键：primary / success / warning / danger / neutral
const chartColors = [
  colors.primary[500],
  colors.success[500],
  colors.warning[500],
  colors.danger[500],
];

// 间距（spacing['4'] === '1rem'）
const gap = spacing['4'];

// 排版（typography.fontSize.base === '1rem'）
const baseSize = typography.fontSize.base;

// 阴影（effects.shadow.md）
const cardShadow = effects.shadow.md;

// 圆角（effects.borderRadius.lg）
const cardRadius = effects.borderRadius.lg;
```

---

## Token 速查

### 颜色（调色板原子色）

前缀统一为 `--du-`，无 `color` 中缀，分类 50–900 刻度。

```css
/* 主色 (primary) */
var(--du-primary-50)    /* #eff6ff，最浅 */
var(--du-primary-100)
var(--du-primary-400)   /* #60a5fa */
var(--du-primary-500)   /* #3b82f6，品牌主色 */
var(--du-primary-600)
var(--du-primary-700)
var(--du-primary-900)   /* #1e3a8a，最深 */

/* 成功色 (success) */
var(--du-success-50)
var(--du-success-500)   /* #22c55e */
var(--du-success-700)   /* #15803d */

/* 警告色 (warning) */
var(--du-warning-50)
var(--du-warning-500)   /* #f59e0b */

/* 危险/错误色 (danger) — 注意：不是 error */
var(--du-danger-50)
var(--du-danger-500)    /* #ef4444 */
var(--du-danger-700)    /* #b91c1c */

/* 中性色 (neutral) — 注意：不是 gray */
var(--du-neutral-50)    /* #fafafa，最浅 */
var(--du-neutral-300)   /* #d4d4d4 */
var(--du-neutral-500)   /* #737373 */
var(--du-neutral-700)   /* #404040 */
var(--du-neutral-900)   /* #171717，近黑 */
```

### 颜色（语义别名，自动跟随主题切换）

```css
/* 功能色别名 */
var(--du-color-primary)          /* 主色，light: primary-500 / dark: primary-400 */
var(--du-color-primary-light)    /* 主色浅背景 */
var(--du-color-primary-hover)    /* 悬停态 */
var(--du-color-primary-active)   /* 激活态 */

var(--du-color-success)
var(--du-color-success-light)
var(--du-color-warning)
var(--du-color-warning-light)
var(--du-color-danger)           /* 危险/错误语义色 */
var(--du-color-danger-light)
var(--du-color-info)
var(--du-color-info-light)

/* 文字色 */
var(--du-color-text-primary)     /* 主文字，light: neutral-900 */
var(--du-color-text-secondary)   /* 次要文字，light: neutral-600 */
var(--du-color-text-placeholder) /* 占位符，light: neutral-400 */
var(--du-color-text-disabled)    /* 禁用，light: neutral-300 */

/* 背景色 */
var(--du-color-bg-primary)       /* 主背景，light: #ffffff */
var(--du-color-bg-secondary)     /* 次背景，light: neutral-50 */
var(--du-color-bg-tertiary)      /* 三级背景，light: neutral-100 */

/* 边框色 */
var(--du-color-border)           /* 主边框，light: neutral-200 */
var(--du-color-border-light)     /* 浅边框 */
var(--du-color-border-hover)     /* 悬停边框 */
```

### 间距（4px 基础单位，rem 输出）

```css
var(--du-spacing-0)   /* 0 */
var(--du-spacing-1)   /* 0.25rem = 4px */
var(--du-spacing-2)   /* 0.5rem  = 8px */
var(--du-spacing-3)   /* 0.75rem = 12px */
var(--du-spacing-4)   /* 1rem    = 16px */
var(--du-spacing-5)   /* 1.25rem = 20px */
var(--du-spacing-6)   /* 1.5rem  = 24px */
var(--du-spacing-8)   /* 2rem    = 32px */
var(--du-spacing-10)  /* 2.5rem  = 40px */
var(--du-spacing-12)  /* 3rem    = 48px */
var(--du-spacing-16)  /* 4rem    = 64px */
var(--du-spacing-20)  /* 5rem    = 80px */
```

### 排版（注意 camelCase）

```css
/* 字体族 */
var(--du-fontFamily-sans)  /* 系统 sans-serif 栈 */
var(--du-fontFamily-mono)  /* 等宽字体栈 */

/* 字号（fontSize，camelCase） */
var(--du-fontSize-xs)    /* 0.75rem  = 12px */
var(--du-fontSize-sm)    /* 0.875rem = 14px */
var(--du-fontSize-base)  /* 1rem     = 16px */
var(--du-fontSize-lg)    /* 1.125rem = 18px */
var(--du-fontSize-xl)    /* 1.25rem  = 20px */
var(--du-fontSize-2xl)   /* 1.5rem   = 24px */
var(--du-fontSize-3xl)   /* 1.875rem = 30px */
var(--du-fontSize-4xl)   /* 2.25rem  = 36px */

/* 字重（fontWeight，camelCase） */
var(--du-fontWeight-normal)    /* 400 */
var(--du-fontWeight-medium)    /* 500 */
var(--du-fontWeight-semibold)  /* 600 */
var(--du-fontWeight-bold)      /* 700 */

/* 行高（lineHeight，camelCase） */
var(--du-lineHeight-tight)    /* 1.25 */
var(--du-lineHeight-normal)   /* 1.5 */
var(--du-lineHeight-relaxed)  /* 1.75 */
```

### 效果（阴影、圆角）

```css
/* 阴影 */
var(--du-shadow-sm)    /* 小阴影 */
var(--du-shadow-base)  /* 基础阴影 */
var(--du-shadow-md)    /* 中阴影 */
var(--du-shadow-lg)    /* 大阴影 */
var(--du-shadow-xl)    /* 超大阴影 */

/* 圆角（radius 是 borderRadius 的语义别名，两者均可用） */
var(--du-radius-sm)    /* 0.25rem = 4px  (= --du-borderRadius-sm) */
var(--du-radius-base)  /* 0.375rem = 6px */
var(--du-radius-md)    /* 0.5rem  = 8px  */
var(--du-radius-lg)    /* 0.75rem = 12px */
var(--du-radius-xl)    /* 1rem    = 16px */
var(--du-radius-full)  /* 9999px，圆形   */
```

---

## 实际应用示例

```vue
<style scoped>
.user-card {
  background: var(--du-color-bg-primary);
  border-radius: var(--du-radius-lg);
  box-shadow: var(--du-shadow-md);
  padding: var(--du-spacing-6);
  border: 1px solid var(--du-color-border);
}

.user-name {
  font-size: var(--du-fontSize-lg);
  font-weight: var(--du-fontWeight-bold);
  color: var(--du-color-text-primary);
}

.user-role {
  font-size: var(--du-fontSize-sm);
  color: var(--du-color-text-secondary);
  margin-top: var(--du-spacing-1);
}

.status-badge {
  background: var(--du-success-50);
  color: var(--du-success-700);
  padding: var(--du-spacing-1) var(--du-spacing-2);
  border-radius: var(--du-radius-full);
  font-size: var(--du-fontSize-xs);
}

.error-text {
  color: var(--du-color-danger); /* 注意：是 danger 不是 error */
  font-size: var(--du-fontSize-sm);
}
</style>
```

---

## 常见错误

| 错误写法                          | 正确写法                            | 原因                            |
| --------------------------------- | ----------------------------------- | ------------------------------- |
| `var(--do-color-primary-500)`     | `var(--du-primary-500)`             | 前缀是 `--du-`，无 `color` 中缀 |
| `var(--du-color-gray-900)`        | `var(--du-neutral-900)`             | 没有 `gray`，是 `neutral`       |
| `var(--du-color-error-500)`       | `var(--du-danger-500)`              | 没有 `error`，是 `danger`       |
| `var(--du-color-danger)` = 原子色 | `var(--du-color-danger)` 是语义别名 | 语义别名无数字刻度              |
| `var(--du-font-size-base)`        | `var(--du-fontSize-base)`           | 排版用 camelCase                |
| `var(--du-font-weight-bold)`      | `var(--du-fontWeight-bold)`         | 排版用 camelCase                |
| `colors.error[500]`               | `colors.danger[500]`                | JS 对象键与 CSS 分类一致        |
| `colors.gray[900]`                | `colors.neutral[900]`               | JS 对象键与 CSS 分类一致        |
