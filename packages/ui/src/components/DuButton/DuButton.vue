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

<script setup lang="ts">
defineOptions({ name: 'DuButton' });

withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'medium',
  loading: false,
  disabled: false,
  permission: undefined,
});

defineEmits<{
  click: [event: MouseEvent];
}>();

interface Props {
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'default';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  permission?: string;
}
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
  transition: all var(--ku-transition-base, 200ms cubic-bezier(0.4, 0, 0.2, 1));
  outline: none;
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
  padding: var(--ku-space-3, 0.75rem) var(--ku-space-6, 1.5rem);
  font-size: var(--ku-font-size-base, 1rem);
}

.du-button-default {
  background: var(--ku-bg-card, #ffffff);
  border-color: var(--ku-border-hover, #c6c9ce);
  color: var(--ku-neutral-700, #404040);
}

.du-button-default:hover {
  border-color: var(--ku-color-primary, #3370ff);
  color: var(--ku-color-primary, #3370ff);
}

.du-button-primary {
  background: var(--ku-color-primary, #3370ff);
  color: var(--ku-bg-card, #ffffff);
}

.du-button-primary:hover {
  background: var(--ku-color-primary-hover, #245bdb);
}

.du-button-success {
  background: var(--ku-color-success, #34c724);
  color: var(--ku-bg-card, #ffffff);
}

.du-button-success:hover {
  background: var(--ku-success-600, #2ca91f);
}

.du-button-warning {
  background: var(--ku-color-warning, #ff8800);
  color: var(--ku-bg-card, #ffffff);
}

.du-button-warning:hover {
  background: var(--ku-warning-600, #d97400);
}

.du-button-danger {
  background: var(--ku-color-danger, #f54a45);
  color: var(--ku-bg-card, #ffffff);
}

.du-button-danger:hover {
  background: var(--ku-danger-600, #d03f3b);
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
  border-radius: var(--ku-radius-full, 9999px);
  animation: du-spin 0.6s linear infinite;
}

@keyframes du-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
