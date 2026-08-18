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
  background: var(--ku-bg-card);
  border-radius: var(--ku-radius-md);
  overflow: hidden;
  transition: box-shadow var(--ku-transition-base);
}

.du-card-bordered {
  border: 1px solid var(--ku-border-default);
}

.du-card-hoverable:hover {
  box-shadow: var(--ku-shadow-md);
}

.du-card-shadow {
  box-shadow: var(--ku-shadow-base);
}

.du-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ku-space-4) var(--ku-space-5);
  border-bottom: 1px solid var(--ku-border-default);
}

.du-card-title {
  font-size: var(--ku-font-size-base);
  font-weight: var(--ku-font-weight-semibold);
  color: var(--ku-text-primary);
}

.du-card-subtitle {
  margin-left: var(--ku-space-2);
  font-size: var(--ku-font-size-sm);
  color: var(--ku-text-secondary);
}

.du-card-extra {
  margin-left: auto;
}

.du-card-body {
  padding: var(--ku-space-5);
}

.du-card-footer {
  padding: var(--ku-space-3) var(--ku-space-5);
  border-top: 1px solid var(--ku-border-default);
}
</style>
