# @ku-utils/design-tokens

> 设计令牌（CSS / SCSS / JS / JSON），支持亮色与暗色主题。

## 安装

```bash
pnpm add @ku-utils/design-tokens
```

## 使用

CSS 变量：

```ts
import '@ku-utils/design-tokens/css';
```

SCSS 变量：

```scss
@use '@ku-utils/design-tokens/scss';

.box {
  color: $du-color-primary;
}
```

JS/JSON 按需导入：

```ts
import tokens from '@ku-utils/design-tokens/json';
```

## 安装源

发布于 npmjs.org，直接 `pnpm add` 即可。

---

详细文档请参考 [ku-utils 文档站](../../docs/)
