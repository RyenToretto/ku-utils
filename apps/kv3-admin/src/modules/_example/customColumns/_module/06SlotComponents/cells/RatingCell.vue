<template>
  <div class="rating-cell">
    <el-rate
      :model-value="score"
      disabled
      :max="5"
      allow-half
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  row: Record<string, unknown>;
}>();

const score = computed(() => Math.min(5, Number(props.row.score || 0) / 20));
</script>
