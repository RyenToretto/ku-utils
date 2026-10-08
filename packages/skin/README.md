# @ku-utils/skin

ku-utils 团队统一皮肤：以 `--ku-*` 为唯一语义变量层，同一份 CSS 里桥接 Element Plus 的 `--el-*`，供 `@ku-utils/ui`（Vue 3）、`@ku-utils/ui-vue2`（Vue 2）、Nuxt 应用与 `kv3-admin` 等所有系统共用。

**唯一金标皮肤：`tome`（巨效典籍）**。包默认导出即 `tome`。

## 安装

```bash
pnpm add @ku-utils/skin
```

## 使用

```ts
// main.ts / main.js —— 越早引入越好，第三方 CSS 之后、业务样式之前
import 'element-plus/theme-chalk/dark/css-vars.css'; // 用 Element Plus 才需要；必须在 skin 之前
import '@ku-utils/skin'; // 默认 = tome
import '@ku-utils/ui/style';
```

显式路径与默认等价：

```ts
import '@ku-utils/skin/tome';
```

只要通用间距/圆角/字号等 token，不要品牌色（例如自己实现的皮肤系统，只想借用 `--ku-space-*` / `--ku-radius-*`）：

```ts
import '@ku-utils/skin/base';
```

## JS 主题系统（antd 等）

antd 这类需要用真实色值派生 hover/active 色阶的主题系统，不能吃 `var(--ku-*)`。用已解析的明暗两套色值（键名 = `--ku-*` 去前缀，暗色已合并在浅色之上）：

```ts
import tome from '@ku-utils/skin/tokens';

const ku = isDark ? tome.dark : tome.light;
ku['color-primary']; // 浅色 #9a6328 / 暗色 #e0a060
```

CSS 仍需照常 `import '@ku-utils/skin'`；`tokens` 只给 JS 主题配置用，不替代 `--ku-*`。

## 明暗切换

本包不做运行时换肤逻辑，只提供 `:root`（Light）+ `html.dark`（Dark）两套变量。切换暗色只需要在 `<html>` 上加/去掉 `dark` class：

```ts
document.documentElement.classList.toggle('dark', isDark);
```

## Token 契约

完整变量清单、语义、新增/废弃规则见 [`TOKEN.md`](./TOKEN.md)。

## 设计原则

- **皮肤是数据，CSS 是产物**：金标皮肤在 `src/themes/tome.js` 里只维护品牌语义色，`scripts/generate.mjs` 现算状态色完整色阶 `--ku-color-{family}-light-1..9` / `dark-2` / `rgb`，不手写第二套色板；antd / ng-zorro 等非 Element 栈要与 Element Plus 同值时直接读这组变量。
- **一层语义，桥接 Element Plus**：业务和 `Du*` 组件只读 `--ku-*`；`--el-*` 全部是 `var(--ku-*)` 的转发，声明在 `:root, html.dark` 共享块（与 Element Plus `dark/css-vars.css` 同优先级），所以 skin 必须在它之后引入。
- **组件库带 fallback、不打皮肤 CSS**：`packages/ui` 等写成 `var(--ku-xxx, <tome 浅色值>)`，应用 `import '@ku-utils/skin'` 后走金标变量。
- **不维护多套备选皮肤**：变更色值只改 `tome.js` 后 `pnpm --filter @ku-utils/skin build`。

## 本地开发

```bash
pnpm --filter @ku-utils/skin build   # 生成 dist/*.css
pnpm --filter @ku-utils/skin dev     # watch 模式
```
