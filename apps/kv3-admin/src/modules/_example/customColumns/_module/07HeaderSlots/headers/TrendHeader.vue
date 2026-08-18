<template>
  <span class="trend-header">
    {{ label }}
    <el-icon><TrendCharts /></el-icon>
  </span>
</template>

<script setup lang="ts">
import { TrendCharts } from '@element-plus/icons-vue';

defineProps<{ label: string }>();
</script>

<style lang="scss" scoped>
.trend-header {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
