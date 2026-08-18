---
name: ui
description: 使用 @ku-utils/ui 的 Vue 3 业务组件（DuButton、DuEmpty、DuModal、DuCard、DuStatusTag）。当需要展示空态、按钮、弹窗、卡片、状态标签时使用。
---

# @ku-utils/ui Skill

Vue 3 业务组件库，提供 DuButton、DuEmpty、DuModal、DuCard、DuStatusTag。

## 安装

```bash
npm install @ku-utils/ui
```

```ts
// main.ts
import { install } from '@ku-utils/ui';
import '@ku-utils/ui/style';
app.use(install);
```

## DuEmpty — 空态

```html
<!-- 基础空态 -->
<DuEmpty description="暂无数据" />

<!-- 错误状态 -->
<DuEmpty
  description="加载失败，请重试"
  icon="error"
>
  <template #action>
    <el-button @click="reload">重新加载</el-button>
  </template>
</DuEmpty>

<!-- 自定义图标 -->
<DuEmpty
  description="没有搜索结果"
  icon="search"
/>
```

## DuButton — 按钮

```html
<!-- 基础 -->
<DuButton @click="handleClick">默认按钮</DuButton>

<!-- 主要 -->
<DuButton
  type="primary"
  @click="submit"
>
  提交
</DuButton>

<!-- 加载状态 -->
<DuButton
  type="primary"
  :loading="isSubmitting"
  @click="submit"
>
  {{ isSubmitting ? '提交中...' : '提交' }}
</DuButton>

<!-- 禁用 -->
<DuButton :disabled="!isValid">保存</DuButton>

<!-- 危险操作 -->
<DuButton
  type="danger"
  @click="handleDelete"
>
  删除
</DuButton>
```

## DuCard — 卡片

```html
<!-- 基础卡片 -->
<DuCard title="用户信息">
  <el-form>...</el-form>
</DuCard>

<!-- 带操作区 -->
<DuCard title="列表">
  <template #extra>
    <DuButton
      type="primary"
      @click="handleCreate"
    >
      新增
    </DuButton>
  </template>
  <el-table>...</el-table>
</DuCard>

<!-- 无边框 -->
<DuCard :bordered="false">内容</DuCard>
```

## DuStatusTag — 状态标签

```html
<DuStatusTag status="success">已完成</DuStatusTag>
<DuStatusTag status="warning">处理中</DuStatusTag>
<DuStatusTag status="error">已失败</DuStatusTag>
<DuStatusTag status="info">待处理</DuStatusTag>
<DuStatusTag status="default">未开始</DuStatusTag>

<!-- 在表格中使用 -->
<el-table-column label="状态">
  <template #default="{ row }">
    <DuStatusTag :status="row.status">{{ STATUS_MAP[row.status] }}</DuStatusTag>
  </template>
</el-table-column>
```

## DuModal — 弹窗

```html
<template>
  <DuModal
    v-model:visible="dialogVisible"
    title="编辑用户"
    width="600px"
    :loading="isSubmitting"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <el-form
      :model="form"
      label-width="100px"
    >
      <el-form-item label="用户名">
        <el-input v-model="form.username" />
      </el-form-item>
    </el-form>
  </DuModal>
</template>

<script setup>
  const dialogVisible = ref(false);
  const isSubmitting = ref(false);
  const form = reactive({ username: '' });

  async function handleConfirm() {
    isSubmitting.value = true;
    try {
      await updateUser(form);
      dialogVisible.value = false;
    } finally {
      isSubmitting.value = false;
    }
  }
</script>
```

## 按需引入（tree-shaking）

```ts
import { DuButton, DuEmpty } from '@ku-utils/ui';
import '@ku-utils/ui/style';
```
