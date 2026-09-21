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
  background: var(--ku-bg-overlay, rgba(31, 35, 41, 0.5));
  z-index: var(--ku-z-modal, 1050);
}

.du-modal {
  background: var(--ku-bg-card, #f7f3eb);
  border-radius: var(--ku-radius-md, 0.5rem);
  box-shadow: var(
    --ku-shadow-xl,
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1)
  );
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.du-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ku-space-4, 1rem) var(--ku-space-6, 1.5rem);
  border-bottom: 1px solid var(--ku-border-default, #c5bcb0);
}

.du-modal-title {
  font-size: var(--ku-font-size-base, 1rem);
  font-weight: var(--ku-font-weight-semibold, 600);
}

.du-modal-close {
  background: none;
  border: none;
  font-size: var(--ku-font-size-2xl, 1.5rem);
  cursor: pointer;
  color: var(--ku-text-placeholder, #8a8172);
  line-height: 1;
}

.du-modal-close:hover {
  color: var(--ku-text-primary, #4e4540);
}

.du-modal-body {
  padding: var(--ku-space-6, 1.5rem);
  overflow-y: auto;
  flex: 1;
}

.du-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--ku-space-2, 0.5rem);
  padding: var(--ku-space-4, 1rem) var(--ku-space-6, 1.5rem);
  border-top: 1px solid var(--ku-border-default, #c5bcb0);
}

.du-modal-fade-enter-active,
.du-modal-fade-leave-active {
  transition: opacity var(--ku-transition-base, 200ms cubic-bezier(0.4, 0, 0.2, 1));
}

.du-modal-fade-enter-from,
.du-modal-fade-leave-to {
  opacity: 0;
}
</style>
