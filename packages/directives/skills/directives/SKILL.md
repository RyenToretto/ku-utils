---
name: directives
description: 使用 @ku-utils/directives 中的 Vue 3 自定义指令（v-permission、v-loading、v-copy、v-debounce 等）。当需要权限控制、加载状态、复制、防抖、懒加载等功能时使用。
---

# @ku-utils/directives Skill

Vue 3 自定义指令集合，含 RBAC 权限控制、加载、复制、防抖等。

## 安装与注册

```bash
npm install @ku-utils/directives
```

```ts
// main.ts — 全局注册（推荐）
import { installDirectives } from '@ku-utils/directives';
app.use(installDirectives);

// 或按需注册
import { vPermission, vLoading } from '@ku-utils/directives';
app.directive('permission', vPermission);
app.directive('loading', vLoading);
```

## 指令详解

### v-permission — 权限控制

```html
<!-- 需要 'admin' 角色才显示 -->
<el-button v-permission="'admin'">删除</el-button>

<!-- 拥有任一角色即显示 -->
<el-button v-permission="['admin', 'editor']">编辑</el-button>

<!-- 拥有所有角色才显示 -->
<el-button v-permission="{ roles: ['admin', 'editor'], mode: 'all' }">特殊操作</el-button>
```

> `v-permission` 通过检查全局 store 或 `app.config.globalProperties.$permission` 判断权限，需确保权限数据已注入。

### v-loading — 加载状态

```html
<!-- 基础用法 -->
<div v-loading="isLoading">
  <el-table :data="list" />
</div>

<!-- 自定义提示文字 -->
<div v-loading="{ loading: isLoading, text: '数据加载中...' }">内容</div>
```

### v-click-outside — 点击外部

```html
<template>
  <div
    class="dropdown"
    v-click-outside="closeDropdown"
  >
    <el-button @click="toggle">切换</el-button>
    <ul v-show="open">
      ...
    </ul>
  </div>
</template>

<script setup>
  const open = ref(false);
  const toggle = () => (open.value = !open.value);
  const closeDropdown = () => (open.value = false);
</script>
```

### v-copy — 一键复制

```html
<!-- 点击后复制指定文本 -->
<span v-copy="inviteCode">{{ inviteCode }} 复制</span>

<!-- 复制成功回调 -->
<span v-copy="{ text: inviteCode, onCopied: () => message.success('已复制') }">复制</span>
```

### v-debounce — 防抖

```html
<!-- 500ms 防抖（默认 300ms） -->
<el-button v-debounce:500="handleSubmit">提交</el-button>

<!-- 搜索框防抖 -->
<el-input v-debounce:300.keyup="handleSearch" />
```

### v-lazy-load — 图片懒加载

```html
<!-- 进入视口才加载图片 -->
<img
  v-lazy-load="imageUrl"
  alt="商品图"
/>

<!-- 带占位图 -->
<img v-lazy-load="{ src: imageUrl, placeholder: '/placeholder.jpg' }" />
```

### v-longpress — 长按

```html
<!-- 700ms 长按触发 -->
<div v-longpress="handleLongPress">长按操作</div>

<!-- 自定义时长 -->
<div v-longpress:1000="handleLongPress">长按1秒</div>
```

### v-tooltip — 工具提示

```html
<span v-tooltip="'详细说明文字'">鼠标悬停</span>

<!-- 带位置 -->
<span v-tooltip="{ content: '提示', placement: 'top' }">鼠标悬停</span>
```

## 权限控制最佳实践

`installDirectives(app)` **不接受配置对象**，`v-permission` 的权限判断逻辑由 `v-permission` 内部实现（通常读取全局 store 或 `app.config.globalProperties.$permission`）。如需自定义权限检查，可按需注册 `vPermission` 并包装逻辑：

```ts
// main.ts — 全局批量注册（无第二个参数）
import { installDirectives } from '@ku-utils/directives';
app.use(installDirectives);

// 如需自定义权限逻辑，在 app 上直接覆盖 $permission 属性
app.config.globalProperties.$permission = (required: string | string[]) => {
  const userStore = useUserStore();
  const required_arr = Array.isArray(required) ? required : [required];
  return required_arr.some((role) => userStore.roles.includes(role));
};
```
