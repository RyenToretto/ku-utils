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
  padding: 0.125rem var(--ku-space-2);
  border-radius: var(--ku-radius-full);
  font-size: var(--ku-font-size-xs);
  font-weight: var(--ku-font-weight-medium);
}

.du-status-tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.du-status-tag-success {
  background: var(--ku-color-success-bg);
  color: var(--ku-success-600);
}

.du-status-tag-warning {
  background: var(--ku-color-warning-bg);
  color: var(--ku-warning-600);
}

.du-status-tag-danger {
  background: var(--ku-color-danger-bg);
  color: var(--ku-danger-600);
}

.du-status-tag-info {
  background: var(--ku-color-info-bg);
  color: var(--ku-primary-600);
}

.du-status-tag-default {
  background: var(--ku-bg-sidebar);
  color: var(--ku-text-secondary);
}
</style>
