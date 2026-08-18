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
  gap: var(--ku-space-2);
  border: 1px solid transparent;
  border-radius: var(--ku-radius-base);
  font-weight: var(--ku-font-weight-medium);
  cursor: pointer;
  transition: all var(--ku-transition-base);
  outline: none;
}

.du-button-small {
  padding: var(--ku-space-1) var(--ku-space-3);
  font-size: var(--ku-font-size-xs);
}

.du-button-medium {
  padding: var(--ku-space-2) var(--ku-space-4);
  font-size: var(--ku-font-size-sm);
}

.du-button-large {
  padding: var(--ku-space-3) var(--ku-space-6);
  font-size: var(--ku-font-size-base);
}

.du-button-default {
  background: var(--ku-bg-card);
  border-color: var(--ku-border-hover);
  color: var(--ku-neutral-700);
}

.du-button-default:hover {
  border-color: var(--ku-color-primary);
  color: var(--ku-color-primary);
}

.du-button-primary {
  background: var(--ku-color-primary);
  color: var(--ku-bg-card);
}

.du-button-primary:hover {
  background: var(--ku-color-primary-hover);
}

.du-button-success {
  background: var(--ku-color-success);
  color: var(--ku-bg-card);
}

.du-button-success:hover {
  background: var(--ku-success-600);
}

.du-button-warning {
  background: var(--ku-color-warning);
  color: var(--ku-bg-card);
}

.du-button-warning:hover {
  background: var(--ku-warning-600);
}

.du-button-danger {
  background: var(--ku-color-danger);
  color: var(--ku-bg-card);
}

.du-button-danger:hover {
  background: var(--ku-danger-600);
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
  border-radius: var(--ku-radius-full);
  animation: du-spin 0.6s linear infinite;
}

@keyframes du-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
