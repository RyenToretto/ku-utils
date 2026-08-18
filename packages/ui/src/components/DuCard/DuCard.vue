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
  background: var(--du-color-bg-primary);
  border-radius: var(--du-radius-md);
  overflow: hidden;
  transition: box-shadow var(--du-transition-base);
}

.du-card-bordered {
  border: 1px solid var(--du-color-border);
}

.du-card-hoverable:hover {
  box-shadow: var(--du-shadow-md);
}

.du-card-shadow {
  box-shadow: var(--du-shadow-base);
}

.du-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--du-spacing-4) var(--du-spacing-5);
  border-bottom: 1px solid var(--du-color-border);
}

.du-card-title {
  font-size: var(--du-fontSize-base);
  font-weight: var(--du-fontWeight-semibold);
  color: var(--du-color-text-primary);
}

.du-card-subtitle {
  margin-left: var(--du-spacing-2);
  font-size: var(--du-fontSize-sm);
  color: var(--du-color-text-secondary);
}

.du-card-extra {
  margin-left: auto;
}

.du-card-body {
  padding: var(--du-spacing-5);
}

.du-card-footer {
  padding: var(--du-spacing-3) var(--du-spacing-5);
  border-top: 1px solid var(--du-color-border);
}
</style>
