<template>
  <div
    class="du-card"
    :class="[
      { 'du-card-bordered': bordered },
      { 'du-card-hoverable': hoverable },
      { 'du-card-shadow': shadow },
    ]"
  >
    <div
      v-if="$slots.header || title"
      class="du-card-header"
    >
      <slot name="header">
        <span class="du-card-title">{{ title }}</span>
        <span
          v-if="subtitle"
          class="du-card-subtitle"
        >
          {{ subtitle }}
        </span>
      </slot>
      <div
        v-if="$slots.extra"
        class="du-card-extra"
      >
        <slot name="extra" />
      </div>
    </div>
    <div
      class="du-card-body"
      :style="bodyStyle"
    >
      <slot />
    </div>
    <div
      v-if="$slots.footer"
      class="du-card-footer"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue';

defineOptions({ name: 'DuCard' });

withDefaults(defineProps<Props>(), {
  title: undefined,
  subtitle: undefined,
  bordered: true,
  hoverable: false,
  shadow: false,
  bodyStyle: undefined,
});

interface Props {
  title?: string;
  subtitle?: string;
  bordered?: boolean;
  hoverable?: boolean;
  shadow?: boolean;
  bodyStyle?: CSSProperties;
}
</script>

<style>
.du-card {
  background: var(--ku-bg-card, #ffffff);
  border-radius: var(--ku-radius-md, 0.5rem);
  overflow: hidden;
  transition: box-shadow var(--ku-transition-base, 200ms cubic-bezier(0.4, 0, 0.2, 1));
}

.du-card-bordered {
  border: 1px solid var(--ku-border-default, #dee0e3);
}

.du-card-hoverable:hover {
  box-shadow: var(
    --ku-shadow-md,
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1)
  );
}

.du-card-shadow {
  box-shadow: var(
    --ku-shadow-base,
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px -1px rgba(0, 0, 0, 0.1)
  );
}

.du-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ku-space-4, 1rem) var(--ku-space-5, 1.25rem);
  border-bottom: 1px solid var(--ku-border-default, #dee0e3);
}

.du-card-title {
  font-size: var(--ku-font-size-base, 1rem);
  font-weight: var(--ku-font-weight-semibold, 600);
  color: var(--ku-text-primary, #1f2329);
}

.du-card-subtitle {
  margin-left: var(--ku-space-2, 0.5rem);
  font-size: var(--ku-font-size-sm, 0.875rem);
  color: var(--ku-text-secondary, #646a73);
}

.du-card-extra {
  margin-left: auto;
}

.du-card-body {
  padding: var(--ku-space-5, 1.25rem);
}

.du-card-footer {
  padding: var(--ku-space-3, 0.75rem) var(--ku-space-5, 1.25rem);
  border-top: 1px solid var(--ku-border-default, #dee0e3);
}
</style>
