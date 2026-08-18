<template>
  <button
    class="du-button"
    :class="[
      `du-button-${type}`,
      `du-button-${size}`,
      { 'du-button-loading': loading, 'du-button-disabled': disabled },
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span
      v-if="loading"
      class="du-button-spinner"
    />
    <slot />
  </button>
</template>

<script>
export default {
  name: 'DuButton',
  props: {
    type: { type: String, default: 'default' },
    size: { type: String, default: 'medium' },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  emits: ['click'],
};
</script>

<style>
.du-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ku-space-2, 0.5rem);
  border: 1px solid transparent;
  border-radius: var(--ku-radius-base, 0.375rem);
  font-weight: var(--ku-font-weight-medium, 500);
  cursor: pointer;
  transition: all var(--ku-transition-base, 200ms ease);
}
.du-button-small {
  padding: var(--ku-space-1, 0.25rem) var(--ku-space-3, 0.75rem);
  font-size: var(--ku-font-size-xs, 0.75rem);
}
.du-button-medium {
  padding: var(--ku-space-2, 0.5rem) var(--ku-space-4, 1rem);
  font-size: var(--ku-font-size-sm, 0.875rem);
}
.du-button-large {
  padding: var(--ku-space-3, 0.625rem) var(--ku-space-6, 1.5rem);
  font-size: var(--ku-font-size-base, 1rem);
}
.du-button-default {
  background: var(--ku-bg-card, #fff);
  border-color: var(--ku-border-hover, #d4d4d4);
  color: var(--ku-neutral-700, #404040);
}
.du-button-default:hover {
  border-color: var(--ku-color-primary, #3b82f6);
  color: var(--ku-color-primary, #3b82f6);
}
.du-button-primary {
  background: var(--ku-color-primary, #3b82f6);
  color: var(--ku-bg-card, #fff);
}
.du-button-primary:hover {
  background: var(--ku-color-primary-hover, #2563eb);
}
.du-button-success {
  background: var(--ku-color-success, #22c55e);
  color: var(--ku-bg-card, #fff);
}
.du-button-warning {
  background: var(--ku-color-warning, #f59e0b);
  color: var(--ku-bg-card, #fff);
}
.du-button-danger {
  background: var(--ku-color-danger, #ef4444);
  color: var(--ku-bg-card, #fff);
}
.du-button-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.du-button-loading {
  cursor: wait;
}
.du-button-spinner {
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: du-spin 0.6s linear infinite;
}
@keyframes du-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
