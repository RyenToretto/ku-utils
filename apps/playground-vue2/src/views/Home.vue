<template>
  <div class="home">
    <h2>Home</h2>
    <p>Count: {{ $store.state.count }}</p>
    <button @click="$store.commit('increment')">+1</button>
    <p>
      <router-link to="/report-demo">打开 Report 支付与事件池 Demo →</router-link>
    </p>
  </div>
</template>

<script>
export default {
  name: 'Home',
};
</script>
