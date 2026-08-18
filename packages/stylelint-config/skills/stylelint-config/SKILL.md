---
name: stylelint-config
description: 为项目配置 @ku-utils/stylelint-config CSS/SCSS 规范（禁止 & 拼接类名）。当初始化项目 Stylelint 或遇到样式 lint 报错时使用。
---

# @ku-utils/stylelint-config Skill

CSS/SCSS 规范配置，核心是 `ku-utils/no-ampersand-class-concat` 规则：禁止用 `&` 拼接类名。

## 安装

```bash
npm install -D @ku-utils/stylelint-config stylelint
```

## 配置

```js
// .stylelintrc.js（CSS 项目）
module.exports = {
  extends: ['@ku-utils/stylelint-config'],
};

// .stylelintrc.js（SCSS 项目）
module.exports = {
  extends: ['@ku-utils/stylelint-config/scss'],
};
```

## package.json scripts

```json
{
  "scripts": {
    "stylelint": "stylelint \"src/**/*.{css,scss,vue}\"",
    "stylelint:fix": "stylelint \"src/**/*.{css,scss,vue}\" --fix"
  }
}
```

## 核心规则：禁止 & 拼接类名

`ku-utils/no-ampersand-class-concat` 规则禁止以下写法：

```scss
// ❌ 这些都违规
.card {
  &-title {
  } // 生成 .card-title
  &__body {
  } // 生成 .card__body（BEM element）
  &--active {
  } // 生成 .card--active（BEM modifier）
  &Primary {
  } // 生成 .cardPrimary
}
```

应改为完整类名：

```scss
// ✅ 正确写法
.card {
}
.card-title {
}
.card__body {
}
.card--active {
}
```

## & 的合法用法

```scss
// ✅ 伪类、伪元素、状态类、属性选择器
.button {
  &:hover {
    opacity: 0.85;
  }
  &:focus {
    outline: 2px solid var(--do-color-primary);
  }
  &::before {
    content: '';
  }
  &::after {
  }
  &.is-active {
    background: var(--do-color-primary);
  }
  &.is-disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  &[type='submit'] {
  }
  &[disabled] {
  }
}
```

## 为什么这样设计？

```scss
// 搜索 ".card-title" 时，无法找到 "&-title" 的写法
// 导致在 1000+ 行的 SCSS 文件中无法快速定位样式来源
.card {
  &-title {
    color: red;
  } // ← 隐藏的类名，IDE 搜索不到
}
```

完整类名写法让样式可被 IDE 直接跳转和搜索。

## SCSS 嵌套与命名规范结合

```scss
// ✅ 推荐：用嵌套表达层次结构，但保持类名可搜索
.user-card {
  padding: 16px;

  // 伪类可以嵌套
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

// 子元素用独立类名（不嵌套在 .user-card 内）
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.user-name {
  font-weight: 600;
}
```
