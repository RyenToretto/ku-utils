# Design Tokens 设计令牌

`@ku-utils/design-tokens` 从 `tokens/` 源文件构建颜色、排版、间距与阴影等令牌，并输出多种消费格式。

## 安装

```bash
pnpm add @ku-utils/design-tokens
```

## 使用示例

在全局样式中引入 CSS 变量：

```css
@import '@ku-utils/design-tokens/css';
```

在 SCSS 中使用变量：

```scss
@use '@ku-utils/design-tokens/scss' as *;

.card {
  color: $du-primary-500;
}
```

在 JS/TS 中导入默认对象（具体嵌套键以生成物为准）：

```typescript
import tokens from '@ku-utils/design-tokens';
```

JSON 平面或嵌套数据：

```typescript
import tokensJson from '@ku-utils/design-tokens/json';
```

## 子路径导出

| 路径                           | 说明                        |
| ------------------------------ | --------------------------- |
| `@ku-utils/design-tokens`      | JS 默认导出（嵌套结构）     |
| `@ku-utils/design-tokens/css`  | `:root { --du-* }` CSS 变量 |
| `@ku-utils/design-tokens/scss` | `$du-*` SCSS 变量           |
| `@ku-utils/design-tokens/json` | JSON 令牌                   |

CSS 变量名由令牌展平后加前缀 `--du-` 生成。
