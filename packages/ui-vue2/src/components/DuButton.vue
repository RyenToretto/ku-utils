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
  gap: 0.5rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 200ms ease;
}
.du-button-small {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
}
.du-button-medium {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}
.du-button-large {
  padding: 0.625rem 1.5rem;
  font-size: 1rem;
}
.du-button-default {
  background: #fff;
  border-color: #d4d4d4;
  color: #404040;
}
.du-button-default:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}
.du-button-primary {
  background: #3b82f6;
  color: #fff;
}
.du-button-primary:hover {
  background: #2563eb;
}
.du-button-success {
  background: #22c55e;
  color: #fff;
}
.du-button-warning {
  background: #f59e0b;
  color: #fff;
}
.du-button-danger {
  background: #ef4444;
  color: #fff;
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
