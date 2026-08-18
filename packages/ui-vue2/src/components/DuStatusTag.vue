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
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}
.du-status-tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.du-status-tag-success {
  background: #f0fdf4;
  color: #16a34a;
}
.du-status-tag-warning {
  background: #fffbeb;
  color: #d97706;
}
.du-status-tag-danger {
  background: #fef2f2;
  color: #dc2626;
}
.du-status-tag-info {
  background: #eff6ff;
  color: #2563eb;
}
.du-status-tag-default {
  background: #f5f5f5;
  color: #525252;
}
</style>
