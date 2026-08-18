# @ku-utils/skin

ku-utils 团队统一皮肤：以 `--ku-*` 为唯一语义变量层，同一份 CSS 里桥接 Element Plus 的 `--el-*`，供 `@ku-utils/ui`（Vue 3）、`@ku-utils/ui-vue2`（Vue 2）、Nuxt 应用与 `kv3-admin` 等所有系统共用同一套换肤逻辑。

## 安装

```bash
pnpm add @ku-utils/skin
```

## 使用

```ts
// main.ts / main.js —— 越早引入越好，第三方 CSS 之后、业务样式之前
import 'element-plus/theme-chalk/dark/css-vars.css'; // 用 Element Plus 才需要
import '@ku-utils/skin'; // 默认皮肤 = lark
import '@ku-utils/ui/style';
```

按需显式引入某一套皮肤（默认 = `lark`，另有 10 套备选皮肤数据，尚未在任何应用里启用）：

```ts
import '@ku-utils/skin/lark';
// 或者切到备选皮肤之一：breeze / dusk / ember / glen / hextech / honey / indigo / iris / orchid / sky
import '@ku-utils/skin/breeze';
```

只要通用间距/圆角/字号等 token，不要品牌色（例如自己实现的皮肤系统，只想借用 `--ku-space-*` / `--ku-radius-*`）：

```ts
import '@ku-utils/skin/base';
```

## 明暗切换

本包不做运行时换肤逻辑，只提供 `:root`（Light）+ `html.dark`（Dark）两套变量。切换暗色只需要在 `<html>` 上加/去掉 `dark` class：

```ts
document.documentElement.classList.toggle('dark', isDark);
```

## 换肤（compile-time）

`@ku-utils/skin` 默认导出即 `lark`（当前唯一在用的皮肤）；`breeze` / `dusk` / `ember` / `glen` / `hextech` / `honey` / `indigo` / `iris` / `orchid` / `sky` 是从 jx-dsp 迁移过来的备选色板，已经是本包的子路径导出，还没有任何应用启用。业务方换肤只需要改一行 import（`@ku-utils/skin` → `@ku-utils/skin/<name>`），不需要在应用自己的目录下另外维护一份皮肤文件。

## Token 契约

完整变量清单、语义、新增/废弃规则见 [`TOKEN.md`](./TOKEN.md)。

## 设计原则

- **皮肤是数据，CSS 是产物**：每套皮肤在 `src/themes/*.js` 里只维护品牌语义色（几十个 key），`scripts/generate.mjs` 现算 Element Plus 的完整色阶（`light-1..9` / `dark-2` / `rgb`），不手写第二套色板。
- **一层语义，多套桥接**：业务和 `Du*` 组件只读 `--ku-*`；`--el-*` 全部是 `var(--ku-*)` 的转发或现算结果，不在皮肤里重复定义独立 hex。
- **新增皮肤零改代码**：复制 `src/themes/lark.js` 改色值即可多出一个 `dist/<name>.css`，不需要动 `scripts/generate.mjs`。

## 本地开发

```bash
pnpm --filter @ku-utils/skin build   # 生成 dist/*.css
pnpm --filter @ku-utils/skin dev     # watch 模式
```
