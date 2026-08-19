<template>
  <div class="pg-root">
    <PlaygroundBg />
    <PlaygroundLiquidPane />
    <div class="pg-shell">
      <h1>ku-utils Playground - Vue 2</h1>
      <p>验证 @ku-utils/* 在 Vue 2 中的接入与交互</p>
      <router-view />
    </div>
  </div>
</template>

<script>
import PlaygroundBg from '@/components/PlaygroundBg.vue';
import PlaygroundLiquidPane from '@/components/PlaygroundLiquidPane.vue';

export default {
  name: 'App',
  components: { PlaygroundBg, PlaygroundLiquidPane },
};
</script>
