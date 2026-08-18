<template>
  <header class="base-header">
    <div class="base-header-inner">
      <AdminVersionLogo
        :has-update="hasUpdate"
        @refresh="emit('refresh')"
      />
      <nav class="base-header-menus">
        <component
          :is="ExampleNavTab"
          v-if="ExampleNavTab"
        />
      </nav>
      <div class="base-header-right">
        <HeaderProfileMenu
          :initial="userInitial"
          :display-name="displayName"
          :role="userRole"
          :theme="appStore.theme"
          :show-change-password="false"
          @logout="handleLogout"
          @set-theme="appStore.setTheme"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import ExampleNavTab from '@header-example-tab';
import { computed } from 'vue';

import HeaderProfileMenu from '@/components/HeaderProfileMenu.vue';
import AdminVersionLogo from '@/layouts/AdminVersionLogo.vue';
import { submitLogout } from '@/plugins/axios';
import { useAppStore } from '@/stores/app';
import { useUserStore } from '@/stores/user';

defineProps<{
  hasUpdate: boolean;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const userStore = useUserStore();
const appStore = useAppStore();

const displayName = computed(() => userStore.nickName || userStore.name || '未登录');

const userInitial = computed(() => {
  const name = displayName.value;
  return name.charAt(0).toUpperCase();
});

const userRole = computed(() => userStore.mail || '账户');

function handleLogout() {
  submitLogout('logged-out');
}
</script>

<style lang="scss" scoped>
.base-header {
  flex-shrink: 0;
  z-index: 100;
  height: 56px;
  /* 壳层固定纯黑：不走皮肤，不随 Light/Dark */
  background: #000000;
  color: var(--top-header-text);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

.base-header-inner {
  display: flex;
  align-items: stretch;
  height: 100%;
  padding: 0;
  gap: 0;
}

.base-header-menus {
  display: flex;
  align-items: stretch;
  gap: 0;
  flex: 1;
  min-width: 0;
  padding-left: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.base-header-link {
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  height: 100%;
  padding: 0 16px;
  color: var(--top-header-text-muted);
  text-decoration: none;
  border-radius: 0;
  font-size: 14px;
  line-height: 1;
  white-space: nowrap;
  transition: color var(--el-transition-duration-fast, 0.15s) ease;
  user-select: none;
  -webkit-user-drag: none;
  &:hover {
    color: var(--top-header-text);
  }

  &.router-link-active {
    color: var(--top-header-text);
    background: var(--top-header-active-bg);

    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: var(--top-header-active-indicator-size, 3px);
      background: var(--top-header-active-indicator, var(--primary-color));
    }
  }
}

.base-header-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 8px;
  flex-shrink: 0;
}
</style>
