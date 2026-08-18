<template>
  <span class="badge-header">
    {{ label }}
    <el-tag
      size="small"
      type="warning"
    >
      HOT
    </el-tag>
  </span>
</template>

<script setup lang="ts">
defineProps<{ label: string }>();
</script>

<style lang="scss" scoped>
.badge-header {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>
