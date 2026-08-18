# DuStatusTag 状态标签

轻量状态展示，支持多种语义色与前置圆点。

## 安装

```bash
pnpm add @ku-utils/ui vue
```

```typescript
import '@ku-utils/ui/style';
```

## 使用

```vue
<script setup lang="ts">
import { DuStatusTag } from '@ku-utils/ui';
</script>

<template>
  <DuStatusTag status="success">已通过</DuStatusTag>
  <DuStatusTag
    status="warning"
    dot
  >
    待审核
  </DuStatusTag>
</template>
```

## Props

| 属性   | 类型                                                        | 默认值    | 说明             |
| ------ | ----------------------------------------------------------- | --------- | ---------------- |
| status | `'success' \| 'warning' \| 'danger' \| 'info' \| 'default'` | —（必填） | 语义样式         |
| dot    | `boolean`                                                   | `false`   | 是否显示左侧圆点 |

## 插槽

| 名称    | 说明     |
| ------- | -------- |
| default | 标签文案 |
