<template>
  <div class="du-empty">
    <p class="du-empty-description">{{ description }}</p>
    <div
      v-if="$slots.default"
      class="du-empty-footer"
    >
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'DuEmpty',
  props: {
    description: { type: String, default: '暂无数据' },
  },
};
</script>

<style>
.du-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--ku-space-8, 2rem);
}
.du-empty-description {
  color: var(--ku-text-placeholder, #8f959e);
  font-size: var(--ku-font-size-sm, 0.875rem);
}
.du-empty-footer {
  margin-top: var(--ku-space-4, 1rem);
}
</style>
