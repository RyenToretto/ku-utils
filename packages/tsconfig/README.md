# @ku-utils/tsconfig

> TypeScript 共享配置集，覆盖多种项目类型。

## 安装

```bash
pnpm add -D @ku-utils/tsconfig
```

## 可用配置

| 文件           | 说明        |
| -------------- | ----------- |
| `base.json`    | 基础配置    |
| `vue2.json`    | Vue 2 项目  |
| `vue3.json`    | Vue 3 项目  |
| `nuxt4.json`   | Nuxt 4 项目 |
| `library.json` | 库开发      |

## 使用

```json
// tsconfig.json
{
  "extends": "@ku-utils/tsconfig/vue3.json"
}
```

## 安装源

发布于 npmjs.org，直接 `pnpm add` 即可。

---

详细文档请参考 [ku-utils 文档站](../../docs/)
