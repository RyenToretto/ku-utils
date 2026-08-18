---
name: tsconfig
description: 为项目配置 @ku-utils/tsconfig TypeScript 共享配置。当初始化新项目 tsconfig.json 时使用。
---

# @ku-utils/tsconfig Skill

团队共享 TypeScript 配置，按场景提供 base/vue2/vue3/nuxt4/library 预设。

## 安装

```bash
npm install -D @ku-utils/tsconfig typescript
```

## Vue 3 / Vite 应用

```json
// tsconfig.json
{
  "extends": "@ku-utils/tsconfig/vue3",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*", "env.d.ts"],
  "exclude": ["node_modules", "dist"]
}
```

## Vue 2 应用

```json
{
  "extends": "@ku-utils/tsconfig/vue2",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src/**/*"]
}
```

## Nuxt 4 应用

```json
// tsconfig.json（Nuxt 自动生成 .nuxt/tsconfig.json，此文件 extends 它）
{
  "extends": "./.nuxt/tsconfig.json"
}
```

## TypeScript 库（如工具库）

```json
{
  "extends": "@ku-utils/tsconfig/library",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "declarationDir": "dist"
  },
  "include": ["src/**/*"]
}
```

## 多配置文件场景（tsup/vitest 等工具）

```json
// tsconfig.build.json — 用于 tsup 构建
{
  "extends": "@ku-utils/tsconfig/library",
  "compilerOptions": {
    "noEmit": false,   // 构建时才输出
    "declaration": true
  },
  "include": ["src/**/*"]
}

// tsconfig.json — 用于 IDE 和类型检查
{
  "extends": "@ku-utils/tsconfig/base",
  "compilerOptions": {
    "noEmit": true
  },
  "include": ["src/**/*", "tests/**/*"]
}
```
