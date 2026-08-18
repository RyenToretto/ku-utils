# Stylelint 配置

## 安装

```bash
pnpm add -D @ku-utils/stylelint-config stylelint
# SCSS 项目额外安装
pnpm add -D postcss-scss
```

## 使用

创建 `.stylelintrc.js`：

```javascript
export default {
  extends: '@ku-utils/stylelint-config',
};

// SCSS 项目
export default {
  extends: '@ku-utils/stylelint-config/scss',
};
```

## 团队规则

**禁止使用 & 拼接类名：**

```scss
// 禁止
.card {
  &-header {
  } // ❌ &-header
  &__content {
  } // ❌ &__content
  &--active {
  } // ❌ &--active
}

// 允许
.card-header {
} // ✅ 完整类名
.card {
  &.active {
  }
} // ✅ &.修饰符
```
