<template>
  <div id="app">
    <h1>ku-utils Playground - Vue 2</h1>
    <p>用于验证 @ku-utils/* 包在 Vue 2 环境中的兼容性</p>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
