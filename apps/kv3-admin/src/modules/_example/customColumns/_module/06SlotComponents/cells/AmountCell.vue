<template>
  <div class="amount-cell">{{ display }}</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  row: Record<string, unknown>;
  column: { property?: string };
}>();

const display = computed(() => {
  const val = props.column.property ? props.row[props.column.property] : undefined;
  if (val == null || val === '') return '—';
  return Number(val).toLocaleString('zh-CN');
});
</script>

<style lang="scss" scoped>
.amount-cell {
  font-variant-numeric: tabular-nums;
  text-align: right;
}
</style>
