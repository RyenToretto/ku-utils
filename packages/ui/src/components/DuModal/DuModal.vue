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
  z-index: var(--ku-z-modal);
}

.du-modal {
  background: var(--ku-bg-card);
  border-radius: var(--ku-radius-md);
  box-shadow: var(--ku-shadow-xl);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.du-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ku-space-4) var(--ku-space-6);
  border-bottom: 1px solid var(--ku-border-default);
}

.du-modal-title {
  font-size: var(--ku-font-size-base);
  font-weight: var(--ku-font-weight-semibold);
}

.du-modal-close {
  background: none;
  border: none;
  font-size: var(--ku-font-size-2xl);
  cursor: pointer;
  color: var(--ku-text-placeholder);
  line-height: 1;
}

.du-modal-close:hover {
  color: var(--ku-text-primary);
}

.du-modal-body {
  padding: var(--ku-space-6);
  overflow-y: auto;
  flex: 1;
}

.du-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--ku-space-2);
  padding: var(--ku-space-4) var(--ku-space-6);
  border-top: 1px solid var(--ku-border-default);
}

.du-modal-fade-enter-active,
.du-modal-fade-leave-active {
  transition: opacity var(--ku-transition-base);
}

.du-modal-fade-enter-from,
.du-modal-fade-leave-to {
  opacity: 0;
}
</style>
