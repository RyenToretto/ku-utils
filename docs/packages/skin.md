# Skin 统一皮肤

`@ku-utils/skin` 提供团队统一的换肤方案：以 `--ku-*` 为唯一语义变量层，同一份 CSS 里桥接 Element Plus 的 `--el-*`，供 `@ku-utils/ui`（Vue 3）、`@ku-utils/ui-vue2`（Vue 2）、Nuxt 应用与 `kv3-admin` 等所有系统共用。

## 安装

```bash
pnpm add @ku-utils/skin
```

## 使用

```typescript
// main.ts —— 越早引入越好，第三方 CSS 之后、业务样式之前
import 'element-plus/theme-chalk/dark/css-vars.css'; // 用 Element Plus 才需要
import '@ku-utils/skin'; // 默认皮肤 = lark
import '@ku-utils/ui/style';
```

在 Nuxt 项目里，`@ku-utils/nuxt-module` 开启 `css` 选项（默认开启）会自动注入，无需手动 import。

## 明暗切换

本包不做运行时换肤逻辑，只提供 `:root`（Light）+ `html.dark`（Dark）两套变量，切换暗色只需要在 `<html>` 上加/去掉 `dark` class：

```typescript
document.documentElement.classList.toggle('dark', isDark);
```

## 导出

| 子路径                  | 说明                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `@ku-utils/skin`        | 默认皮肤（= `lark`）                                                                                                                        |
| `@ku-utils/skin/lark`   | 显式引用 `lark` 皮肤（当前唯一在用）                                                                                                        |
| `@ku-utils/skin/<name>` | 备选皮肤：`breeze` / `dusk` / `ember` / `glen` / `hextech` / `honey` / `indigo` / `iris` / `orchid` / `sky`，数据已就位但尚未在任何应用启用 |
| `@ku-utils/skin/base`   | 只要间距/圆角/字号等通用 token，不含品牌色                                                                                                  |

## 设计原则

- **皮肤是数据，CSS 是产物**：每套皮肤在 `src/themes/*.js` 里只维护品牌语义色，`scripts/generate.mjs` 用 `mix()` 现算 Element Plus 的完整色阶，不手写第二套色板。
- **一层语义，多套桥接**：业务和 `Du*` 组件只读 `--ku-*`；`--el-*` 全部是 `var(--ku-*)` 的转发或现算结果。
- **apps 不维护自己的皮肤**：所有换肤数据集中在本包的 `themes/*.js`；消费方（含 `kv3-admin`）只做一行 import，不在应用目录下另存 `theme-*.scss` / 色板 token 文件。

## Token 契约

完整变量清单、语义分类、新增/废弃规则见源码仓库中的 [`packages/skin/TOKEN.md`](https://github.com/RyenToretto/ku-utils/blob/main/packages/skin/TOKEN.md)。
