<template>
  <span
    class="du-status-tag"
    :class="`du-status-tag-${status}`"
  >
    <span
      v-if="dot"
      class="du-status-tag-dot"
    />
    <slot />
  </span>
</template>

<script setup lang="ts">
defineOptions({ name: 'DuStatusTag' });

withDefaults(defineProps<Props>(), {
  dot: false,
});

interface Props {
  status: 'success' | 'warning' | 'danger' | 'info' | 'default';
  dot?: boolean;
}
</script>

<style>
.du-status-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.125rem var(--ku-space-2, 0.5rem);
  border-radius: var(--ku-radius-full, 9999px);
  font-size: var(--ku-font-size-xs, 0.75rem);
  font-weight: var(--ku-font-weight-medium, 500);
}

.du-status-tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.du-status-tag-success {
  background: var(--ku-color-success-bg, #f0faf0);
  color: var(--ku-success-600, #2ca91f);
}

.du-status-tag-warning {
  background: var(--ku-color-warning-bg, #fff7e8);
  color: var(--ku-warning-600, #d97400);
}

.du-status-tag-danger {
  background: var(--ku-color-danger-bg, #fef1f1);
  color: var(--ku-danger-600, #d03f3b);
}

.du-status-tag-info {
  background: var(--ku-color-info-bg, #f7f8fa);
  color: var(--ku-primary-600, #245bdb);
}

.du-status-tag-default {
  background: var(--ku-bg-sidebar, #eff0f1);
  color: var(--ku-text-secondary, #646a73);
}
</style>
