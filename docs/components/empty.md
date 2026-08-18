# DuEmpty 空状态

列表或详情无数据时的占位展示，支持自定义文案、图片与底部操作区。

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
import { DuEmpty } from '@ku-utils/ui';
</script>

<template>
  <DuEmpty description="暂无订单">
    <DuButton type="primary">去下单</DuButton>
  </DuEmpty>
</template>
```

## Props

| 属性        | 类型     | 默认值     | 说明                               |
| ----------- | -------- | ---------- | ---------------------------------- |
| description | `string` | `暂无数据` | 描述文案                           |
| image       | `string` | —          | 自定义图片地址；不传则使用内置 SVG |

## 插槽

| 名称    | 说明                                         |
| ------- | -------------------------------------------- |
| default | 底部区域（如主按钮），有内容时显示在描述下方 |
