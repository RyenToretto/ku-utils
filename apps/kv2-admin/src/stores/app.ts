import { defineStore } from 'pinia';

import { getAppThemeStorageKey, THEME_MODES, type ThemeMode } from '@/utils/theme';

function getSystemThemeQuery() {
  return window.matchMedia('(prefers-color-scheme: dark)');
}

function getStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(getAppThemeStorageKey('admin')) as ThemeMode | null;
  return stored && THEME_MODES.includes(stored) ? stored : 'light';
}

/**
 * Options Store：与 user store 同因，避免 Vue2 下 setup ref 不解包。
 * 依赖 `scripts/ensure-vue-demi-vue27.mjs` 把 pinia 的 vue-demi 锁在 2.7（isVue2），
 * 否则 Pinia 走 Vue3 赋值路径，state 会以 Ref 暴露并触发 toRefs 警告。
 */
export const useAppStore = defineStore('app', {
  state: () => ({
    theme: getStoredTheme() as ThemeMode,
  }),
  actions: {
    applyTheme(target?: ThemeMode) {
      const mode = target ?? this.theme;
      const isDark = mode === 'dark' || (mode === 'system' && getSystemThemeQuery().matches);
      document.documentElement.classList.toggle('dark', isDark);
    },

    setTheme(mode: ThemeMode) {
      this.theme = mode;
      localStorage.setItem(getAppThemeStorageKey('admin'), mode);
      this.applyTheme(mode);
    },

    initThemeListeners() {
      getSystemThemeQuery().addEventListener('change', () => {
        if (this.theme === 'system') this.applyTheme('system');
      });
      this.applyTheme();
    },
  },
});
