<template>
  <div class="home">
    <h2>Home</h2>
    <p>Count: {{ $store.state.count }}</p>
    <button @click="$store.commit('increment')">+1</button>
  </div>
</template>

<script>
export default {
  name: 'Home',
};
</script>
