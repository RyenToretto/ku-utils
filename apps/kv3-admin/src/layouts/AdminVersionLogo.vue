<template>
  <component
    :is="hasUpdate ? 'button' : 'div'"
    class="admin-version-logo"
    :class="{ 'has-update': hasUpdate }"
    v-bind="actionAttrs"
    v-on="hasUpdate ? { click: requestRefresh } : {}"
  >
    <span class="logo-icon-wrap">
      <BrandLogoMark class="logo-mark" />
      <span class="logo-text">
        <span>kv3</span>
        <span>&nbsp;</span>
        <span>admin</span>
      </span>

      <span
        v-if="hasUpdate"
        class="logo-update-badge"
        role="status"
      >
        <span
          class="logo-update-dot"
          aria-hidden="true"
        />
        新版本
      </span>
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import BrandLogoMark from '@/components/BrandLogoMark.vue';

const props = defineProps<{
  hasUpdate: boolean;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const actionAttrs = computed(() => ({
  title: props.hasUpdate ? '发现新版本，点击刷新页面' : 'kv3-admin',
  ...(props.hasUpdate ? { 'aria-label': '发现新版本，点击刷新页面', type: 'button' } : {}),
}));

function requestRefresh() {
  emit('refresh');
}
</script>

<style lang="scss" scoped>
.admin-version-logo {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--layout-aside-width, 220px);
  min-width: var(--layout-aside-width, 220px);
  height: 100%;
  padding: 0;
  margin: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: center;
  cursor: default;
  outline-offset: 2px;
  transition: background-color 0.15s ease;
  &.has-update {
    cursor: pointer;
    user-select: none;
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    &:focus-visible {
      outline: 2px solid rgba(255, 255, 255, 0.55);
    }
  }
}

.logo-icon-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  user-select: none;
  -webkit-user-drag: none;
}

.logo-mark {
  font-size: 22px;
  color: currentColor;
  opacity: 0.95;
}

.logo-text {
  position: relative;
  z-index: 1;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.2;
}

.logo-update-badge {
  box-sizing: border-box;
  padding: 1px 7px 1px 5px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  border-radius: 999px;
  border: 1px solid rgba(245, 108, 108, 0.45);
  background: rgba(245, 108, 108, 0.18);
  color: #ffb4b4;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  transform: translate3d(50%, -50%, 0);
}

.logo-update-dot {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-color-danger, #f56c6c);
}

.admin-version-logo.has-update .logo-update-dot {
  animation: logo-update-dot-pulse 2s ease-in-out infinite;
}

@keyframes logo-update-dot-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.12);
    opacity: 0.88;
  }
}

@media (prefers-reduced-motion: reduce) {
  .admin-version-logo.has-update .logo-update-dot {
    animation: none;
  }
}
</style>
