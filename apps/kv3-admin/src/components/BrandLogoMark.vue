<template>
  <svg
    class="brand-logo-mark"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup lang="ts">
defineOptions({ name: 'BrandLogoMark' });
</script>

<style lang="scss" scoped>
.brand-logo-mark {
  display: block;
  flex-shrink: 0;
  width: 1em;
  height: 1em;
}
</style>
