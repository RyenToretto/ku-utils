# DuButton 按钮

Vue 3 基础按钮组件，支持类型、尺寸、加载态与禁用态。

## 安装

组件由 `@ku-utils/ui` 提供，需安装 Vue 3 与样式：

```bash
pnpm add @ku-utils/ui vue
```

在入口引入样式（若未通过 Nuxt 模块自动注入）：

```typescript
import '@ku-utils/ui/style';
```

## 使用

```vue
<script setup lang="ts">
import { DuButton } from '@ku-utils/ui';
</script>

<template>
  <DuButton
    type="primary"
    @click="onClick"
  >
    提交
  </DuButton>
</template>
```

## Props

| 属性       | 类型                                                           | 默认值    | 说明                                   |
| ---------- | -------------------------------------------------------------- | --------- | -------------------------------------- |
| type       | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'default'` | `default` | 视觉类型                               |
| size       | `'small' \| 'medium' \| 'large'`                               | `medium`  | 尺寸                                   |
| loading    | `boolean`                                                      | `false`   | 加载中（显示转圈并禁用点击）           |
| disabled   | `boolean`                                                      | `false`   | 禁用                                   |
| permission | `string`                                                       | —         | 权限标识（预留，可与业务权限指令配合） |

## 事件

| 事件名 | 载荷         | 说明                                               |
| ------ | ------------ | -------------------------------------------------- |
| click  | `MouseEvent` | 原生点击（`disabled` 或 `loading` 时按钮为禁用态） |

## 插槽

| 名称    | 说明                 |
| ------- | -------------------- |
| default | 按钮文案或图标等内容 |
