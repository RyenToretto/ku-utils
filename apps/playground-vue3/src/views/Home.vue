<template>
  <div class="home">
    <h2>Home</h2>
    <p>Count: {{ counter.count }}</p>
    <button @click="counter.increment()">+1</button>
  </div>
</template>

<script setup lang="ts">
import { useCounterStore } from '@/stores/counter';

const counter = useCounterStore();
</script>
