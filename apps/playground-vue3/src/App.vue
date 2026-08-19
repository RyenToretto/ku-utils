<template>
  <div class="pg-root">
    <PlaygroundBg />
    <PlaygroundLiquidPane />
    <div class="pg-shell">
      <h1>ku-utils Playground - Vue 3</h1>
      <p>验证 @ku-utils/* 在 Vue 3 + TypeScript 中的接入与交互</p>
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import PlaygroundBg from '@/components/PlaygroundBg.vue';
import PlaygroundLiquidPane from '@/components/PlaygroundLiquidPane.vue';
</script>
