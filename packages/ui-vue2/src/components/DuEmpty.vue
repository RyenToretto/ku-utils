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
  padding: 2rem;
}
.du-empty-description {
  color: #a3a3a3;
  font-size: 0.875rem;
}
.du-empty-footer {
  margin-top: 1rem;
}
</style>
