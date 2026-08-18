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
  padding: 0.125rem var(--du-spacing-2);
  border-radius: var(--du-borderRadius-full);
  font-size: var(--du-fontSize-xs);
  font-weight: var(--du-fontWeight-medium);
}

.du-status-tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.du-status-tag-success {
  background: var(--du-color-success-light);
  color: var(--du-success-600);
}

.du-status-tag-warning {
  background: var(--du-color-warning-light);
  color: var(--du-warning-600);
}

.du-status-tag-danger {
  background: var(--du-color-danger-light);
  color: var(--du-danger-600);
}

.du-status-tag-info {
  background: var(--du-color-info-light);
  color: var(--du-primary-600);
}

.du-status-tag-default {
  background: var(--du-color-bg-tertiary);
  color: var(--du-color-text-secondary);
}
</style>
