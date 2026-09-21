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
  background: var(--ku-color-success-bg, #f0f7f2);
  color: var(--ku-success-600, #34834e);
}
.du-status-tag-warning {
  background: var(--ku-color-warning-bg, #fff9e8);
  color: var(--ku-warning-600, #b48814);
}
.du-status-tag-danger {
  background: var(--ku-color-danger-bg, #fdf2f0);
  color: var(--ku-danger-600, #87564c);
}
.du-status-tag-info {
  background: var(--ku-color-info-bg, #f4f1ea);
  color: var(--ku-primary-600, #8b572a);
}
.du-status-tag-default {
  background: var(--ku-bg-sidebar, #4a596b);
  color: var(--ku-text-secondary, #6d655a);
}
</style>
