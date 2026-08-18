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

## AI Skill

安装后自动同步至 `.cursor/skills/design-tokens/SKILL.md`，在 Cursor 对话中可按需调用：

> 使用 @ku-utils/design-tokens 中的颜色/排版/间距/效果设计令牌。当需要在样式中引用品牌色、间距规范、阴影、圆角等时使用。

---

详细文档请参考 [ku-utils 文档站](../../docs/)
