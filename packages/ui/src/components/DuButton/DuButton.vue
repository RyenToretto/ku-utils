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
  gap: var(--du-spacing-2);
  border: 1px solid transparent;
  border-radius: var(--du-radius-base);
  font-weight: var(--du-fontWeight-medium);
  cursor: pointer;
  transition: all var(--du-transition-base);
  outline: none;
}

.du-button-small {
  padding: var(--du-spacing-1) var(--du-spacing-3);
  font-size: var(--du-fontSize-xs);
}

.du-button-medium {
  padding: var(--du-spacing-2) var(--du-spacing-4);
  font-size: var(--du-fontSize-sm);
}

.du-button-large {
  padding: var(--du-spacing-3) var(--du-spacing-6);
  font-size: var(--du-fontSize-base);
}

.du-button-default {
  background: var(--du-color-bg-primary);
  border-color: var(--du-color-border-hover);
  color: var(--du-neutral-700);
}

.du-button-default:hover {
  border-color: var(--du-color-primary);
  color: var(--du-color-primary);
}

.du-button-primary {
  background: var(--du-color-primary);
  color: var(--du-color-bg-primary);
}

.du-button-primary:hover {
  background: var(--du-color-primary-hover);
}

.du-button-success {
  background: var(--du-color-success);
  color: var(--du-color-bg-primary);
}

.du-button-success:hover {
  background: var(--du-success-600);
}

.du-button-warning {
  background: var(--du-color-warning);
  color: var(--du-color-bg-primary);
}

.du-button-warning:hover {
  background: var(--du-warning-600);
}

.du-button-danger {
  background: var(--du-color-danger);
  color: var(--du-color-bg-primary);
}

.du-button-danger:hover {
  background: var(--du-danger-600);
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
  border-radius: var(--du-borderRadius-full);
  animation: du-spin 0.6s linear infinite;
}

@keyframes du-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
