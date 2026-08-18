---
name: vue-best-practices
description: ku-utils 团队 Vue 开发最佳实践
version: 1.0.0
tags: [vue, frontend, best-practices]
---

# Vue 最佳实践

本 Skill 在编写 Vue 2/3 代码时自动应用团队约定。

## Vue 3 项目

### 组件模板

```vue
<template>
  <div class="my-component">
    <h2 class="my-component-title">{{ title }}</h2>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'MyComponent' });

interface Props {
  title: string;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  submit: [data: Record<string, unknown>];
}>();
</script>

<style scoped>
.my-component {
  padding: 1rem;
}

.my-component-title {
  font-size: 1.25rem;
  font-weight: 600;
}
</style>
```

### 关键规则

1. **CSS 类名**：禁止 `&-suffix` / `&__item` / `&--modifier` 拼接，必须写完整类名
2. **Composables**：优先使用 `@ku-utils/hooks`，不重复封装
3. **工具函数**：使用 `@ku-utils/utils`，不自行实现
4. **类型定义**：优先使用 `@ku-utils/types` 的公共类型

## Vue 2 项目

### 组件模板

```vue
<template>
  <div class="my-component">
    <h2 class="my-component-title">{{ title }}</h2>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'MyComponent',
  props: {
    title: { type: String, required: true },
    loading: { type: Boolean, default: false },
  },
};
</script>
```
