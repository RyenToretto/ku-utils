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

<script>
export default {
  name: 'DuStatusTag',
  props: {
    status: { type: String, default: 'default' },
    dot: { type: Boolean, default: false },
  },
};
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
  background: var(--ku-color-success-bg, #f0fdf4);
  color: var(--ku-success-600, #16a34a);
}
.du-status-tag-warning {
  background: var(--ku-color-warning-bg, #fffbeb);
  color: var(--ku-warning-600, #d97706);
}
.du-status-tag-danger {
  background: var(--ku-color-danger-bg, #fef2f2);
  color: var(--ku-danger-600, #dc2626);
}
.du-status-tag-info {
  background: var(--ku-color-info-bg, #eff6ff);
  color: var(--ku-primary-600, #2563eb);
}
.du-status-tag-default {
  background: var(--ku-bg-sidebar, #f5f5f5);
  color: var(--ku-text-secondary, #525252);
}
</style>
