<template>
  <RouterLink
    class="header-example-tab"
    :to="{ name: 'ExampleModule' }"
  >
    Demo
  </RouterLink>
</template>

<script setup lang="ts">
/** 仅 VITE_APP_USE_EXAMPLE=1 时由 Vite alias 接入；生产指向空 stub */
</script>

<style lang="scss" scoped>
.header-example-tab {
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  height: 100%;
  padding: 0 16px;
  color: var(--ku-top-header-text-muted);
  text-decoration: none;
  font-size: 14px;
  line-height: 1;
  white-space: nowrap;
  transition: color var(--el-transition-duration-fast, 0.15s) ease;
  user-select: none;
  -webkit-user-drag: none;

  &:hover {
    color: var(--ku-top-header-text);
  }

  &.router-link-active {
    color: var(--ku-top-header-text);
    background: var(--ku-top-header-active-bg);

    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: var(--ku-top-header-active-indicator-size, 3px);
      background: var(--ku-top-header-active-indicator, var(--ku-color-primary));
    }
  }
}
</style>
