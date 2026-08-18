# DuModal 弹窗

基于 `Teleport` 的居中对话框，支持标题、宽度、遮罩关闭与底部操作区。

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
import { ref } from 'vue';
import { DuButton, DuModal } from '@ku-utils/ui';

const open = ref(false);
</script>

<template>
  <DuButton
    type="primary"
    @click="open = true"
  >
    打开
  </DuButton>
  <DuModal
    v-model="open"
    title="提示"
    width="480px"
  >
    <p>正文内容</p>
    <template #footer>
      <DuButton @click="open = false">取消</DuButton>
      <DuButton
        type="primary"
        @click="open = false"
      >
        确定
      </DuButton>
    </template>
  </DuModal>
</template>
```

## Props

| 属性         | 类型      | 默认值    | 说明                     |
| ------------ | --------- | --------- | ------------------------ |
| modelValue   | `boolean` | —（必填） | 是否显示，配合 `v-model` |
| title        | `string`  | `''`      | 标题                     |
| width        | `string`  | `520px`   | 内容区宽度               |
| closable     | `boolean` | `true`    | 是否显示右上角关闭       |
| maskClosable | `boolean` | `true`    | 点击遮罩是否关闭         |

## 事件

| 事件名            | 说明                                   |
| ----------------- | -------------------------------------- |
| update:modelValue | `v-model` 同步                         |
| cancel            | 关闭时触发（含关闭按钮与遮罩关闭路径） |

确认类交互请在 `#footer` 插槽内自行处理（例如调用接口后 `v-model` 设为 `false`）。

## 插槽

| 名称    | 说明                      |
| ------- | ------------------------- |
| default | 主体内容                  |
| footer  | 底部栏（如确定/取消按钮） |
