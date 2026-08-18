# @ku-utils/ui

> Vue 3 业务组件库。

## 安装

```bash
pnpm add @ku-utils/ui
```

## 组件

`DuButton` · `DuCard` · `DuEmpty` · `DuModal` · `DuStatusTag`

## 使用

```ts
import { install } from '@ku-utils/ui';
import '@ku-utils/ui/style';

app.use(install);
```

```vue
<template>
  <DuButton type="primary">提交</DuButton>
</template>
```

## 安装源

发布于 npmjs.org，直接 `pnpm add` 即可。

## AI Skill

安装后自动同步至 `.cursor/skills/ui/SKILL.md`，在 Cursor 对话中可按需调用：

> 使用 @ku-utils/ui 的 Vue 3 业务组件（DuButton、DuEmpty、DuModal、DuCard、DuStatusTag）。当需要展示空态、按钮、弹窗、卡片、状态标签时使用。

---

详细文档请参考 [ku-utils 文档站](../../docs/)
