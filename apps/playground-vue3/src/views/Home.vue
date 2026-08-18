<template>
  <div class="home">
    <h2>Home</h2>
    <p>Count: {{ counter.count }}</p>
    <button @click="counter.increment()">+1</button>

    <section class="skin-demo">
      <h3>@ku-utils/skin 烟雾验证</h3>
      <p>
        下面按钮的主色应为 Lark 蓝
        <code>#3370ff</code>
        （来自 --ku-color-primary）：
      </p>
      <div class="skin-demo-row">
        <DuButton type="primary">Primary</DuButton>
        <DuButton type="success">Success</DuButton>
        <DuButton type="warning">Warning</DuButton>
        <DuButton type="danger">Danger</DuButton>
        <DuButton>Default</DuButton>
      </div>
      <div class="skin-demo-row">
        <DuStatusTag status="success">成功</DuStatusTag>
        <DuStatusTag status="warning">警告</DuStatusTag>
        <DuStatusTag status="danger">危险</DuStatusTag>
        <DuStatusTag status="info">信息</DuStatusTag>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { DuButton, DuStatusTag } from '@ku-utils/ui';

import { useCounterStore } from '@/stores/counter';

const counter = useCounterStore();
</script>

<style>
.skin-demo {
  margin-top: var(--ku-space-6);
  padding: var(--ku-space-4);
  border: 1px solid var(--ku-border-default);
  border-radius: var(--ku-radius-md);
  background: var(--ku-bg-card);
}

.skin-demo-row {
  display: flex;
  align-items: center;
  gap: var(--ku-space-3);
  margin-top: var(--ku-space-3);
}
</style>
