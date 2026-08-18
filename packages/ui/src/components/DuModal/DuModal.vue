<template>
  <Teleport to="body">
    <Transition name="du-modal-fade">
      <div
        v-if="modelValue"
        class="du-modal-overlay"
        @click.self="onMaskClick"
      >
        <div
          class="du-modal"
          :style="{ width }"
        >
          <div class="du-modal-header">
            <span class="du-modal-title">{{ title }}</span>
            <button
              v-if="closable"
              class="du-modal-close"
              @click="close"
            >
              ×
            </button>
          </div>
          <div class="du-modal-body">
            <slot />
          </div>
          <div
            v-if="$slots.footer"
            class="du-modal-footer"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineOptions({ name: 'DuModal' });

const props = withDefaults(defineProps<Props>(), {
  title: '',
  width: '520px',
  closable: true,
  maskClosable: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
  cancel: [];
}>();

interface Props {
  modelValue: boolean;
  title?: string;
  width?: string;
  closable?: boolean;
  maskClosable?: boolean;
}

function close() {
  emit('update:modelValue', false);
  emit('cancel');
}

function onMaskClick() {
  if (props.maskClosable) close();
}
</script>

<style>
.du-modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  z-index: var(--du-zIndex-modal);
}

.du-modal {
  background: var(--du-color-bg-primary);
  border-radius: var(--du-radius-md);
  box-shadow: var(--du-shadow-xl);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.du-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--du-spacing-4) var(--du-spacing-6);
  border-bottom: 1px solid var(--du-color-border);
}

.du-modal-title {
  font-size: var(--du-fontSize-base);
  font-weight: var(--du-fontWeight-semibold);
}

.du-modal-close {
  background: none;
  border: none;
  font-size: var(--du-fontSize-2xl);
  cursor: pointer;
  color: var(--du-color-text-placeholder);
  line-height: 1;
}

.du-modal-close:hover {
  color: var(--du-color-text-primary);
}

.du-modal-body {
  padding: var(--du-spacing-6);
  overflow-y: auto;
  flex: 1;
}

.du-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--du-spacing-2);
  padding: var(--du-spacing-4) var(--du-spacing-6);
  border-top: 1px solid var(--du-color-border);
}

.du-modal-fade-enter-active,
.du-modal-fade-leave-active {
  transition: opacity var(--du-transition-base);
}

.du-modal-fade-enter-from,
.du-modal-fade-leave-to {
  opacity: 0;
}
</style>
