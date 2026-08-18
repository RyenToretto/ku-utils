<template>
  <div>
    <h1>ku-utils Playground - Nuxt 4</h1>
    <p>用于验证 @ku-utils/* 包在 Nuxt 4 环境中的兼容性</p>
    <p>Count: {{ count }}</p>
    <button @click="count++">+1</button>
    <p>
      <NuxtLink to="/report-demo">打开 Report 支付与事件池 Demo →</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
const count = ref(0);
</script>
