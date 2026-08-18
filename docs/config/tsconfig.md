# TypeScript 配置

## 安装

```bash
pnpm add -D @ku-utils/tsconfig
```

## 预设

Vue 3 项目：

```json
{
  "extends": "@ku-utils/tsconfig/vue3.json"
}
```

Vue 2 项目：

```json
{
  "extends": "@ku-utils/tsconfig/vue2.json"
}
```

Nuxt 4 项目（在 Nuxt 生成类型后，通常与 Nuxt 官方约定一致）：

```json
{
  "extends": "./.nuxt/tsconfig.json"
}
```

库项目：

```json
{
  "extends": "@ku-utils/tsconfig/library.json"
}
```
