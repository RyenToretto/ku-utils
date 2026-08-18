<template>
  <div class="header-profile">
    <el-popover
      v-model:visible="profileMenuVisible"
      placement="bottom-end"
      :width="220"
      trigger="click"
      :persistent="false"
      popper-class="profile-menu-popover"
      @hide="appearanceMenuVisible = false"
    >
      <template #reference>
        <button
          type="button"
          class="profile-avatar-btn header-profile-trigger"
          aria-label="打开账户菜单"
        >
          <el-avatar
            :size="36"
            class="profile-avatar"
          >
            {{ initial }}
          </el-avatar>
        </button>
      </template>

      <div class="profile-menu">
        <div class="profile-menu-hd">
          <el-avatar
            :size="38"
            class="profile-menu-avatar"
          >
            {{ initial }}
          </el-avatar>
          <div class="profile-menu-meta">
            <span class="profile-menu-name">{{ displayName }}</span>
            <span class="profile-menu-role">{{ role }}</span>
          </div>
        </div>

        <div class="profile-menu-divider" />

        <el-popover
          v-model:visible="appearanceMenuVisible"
          placement="left-start"
          :width="160"
          trigger="click"
          :persistent="false"
          popper-class="appearance-menu-popover"
        >
          <template #reference>
            <button
              type="button"
              class="profile-menu-item is-appearance"
            >
              <el-icon><Sunny /></el-icon>
              <span>外观</span>
              <span class="profile-menu-item-value">{{ appearanceLabel }}</span>
              <el-icon class="profile-menu-item-arrow"><ArrowRight /></el-icon>
            </button>
          </template>
          <AppearancePicker
            v-model="themeModel"
            :label-overrides="themeLabels"
          />
        </el-popover>

        <slot name="extra-items" />

        <button
          v-if="showChangePassword"
          type="button"
          class="profile-menu-item"
          @click="handleChangePassword"
        >
          <el-icon><Lock /></el-icon>
          <span>修改密码</span>
        </button>

        <button
          type="button"
          class="profile-menu-item"
          @click="handleLogout"
        >
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </button>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, Lock, Sunny, SwitchButton } from '@element-plus/icons-vue';
import { computed, ref } from 'vue';

import AppearancePicker from '@/components/AppearancePicker.vue';
import type { ThemeMode } from '@/utils/theme';

const props = withDefaults(
  defineProps<{
    initial: string;
    displayName: string;
    role: string;
    theme: ThemeMode;
    showChangePassword?: boolean;
    themeLabels?: Partial<Record<ThemeMode, string>>;
  }>(),
  {
    showChangePassword: false,
    themeLabels: () => ({
      light: '浅色',
      dark: '深色',
      system: '跟随系统',
    }),
  },
);

const emit = defineEmits<{
  logout: [];
  'change-password': [];
  'set-theme': [mode: ThemeMode];
}>();

const profileMenuVisible = ref(false);
const appearanceMenuVisible = ref(false);

const appearanceLabel = computed(
  () => props.themeLabels[props.theme] ?? props.themeLabels.system ?? '跟随系统',
);

const themeModel = computed({
  get: () => props.theme,
  set: (mode: ThemeMode) => handleSetTheme(mode),
});

function closeMenus() {
  appearanceMenuVisible.value = false;
  profileMenuVisible.value = false;
}

function handleSetTheme(mode: ThemeMode) {
  closeMenus();
  emit('set-theme', mode);
}

function handleChangePassword() {
  closeMenus();
  emit('change-password');
}

function handleLogout() {
  closeMenus();
  emit('logout');
}
</script>

<style lang="scss" scoped>
.header-profile {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 16px 0 8px;
}

.header-profile-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  transition: transform var(--el-transition-duration-fast, 0.15s) ease;

  &:hover {
    transform: scale(1.04);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.55);
    outline-offset: 2px;
  }
}
</style>
