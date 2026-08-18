import { defineStore } from 'pinia';
import { ref } from 'vue';

import { getAppThemeStorageKey, THEME_MODES, type ThemeMode } from '@/utils/theme';

function getSystemThemeQuery() {
  return window.matchMedia('(prefers-color-scheme: dark)');
}

function getStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(getAppThemeStorageKey('admin')) as ThemeMode | null;
  return stored && THEME_MODES.includes(stored) ? stored : 'light';
}

export const useAppStore = defineStore('app', () => {
  const theme = ref<ThemeMode>(getStoredTheme());

  function applyTheme(mode = theme.value) {
    const isDark = mode === 'dark' || (mode === 'system' && getSystemThemeQuery().matches);
    document.documentElement.classList.toggle('dark', isDark);
  }

  function setTheme(mode: ThemeMode) {
    theme.value = mode;
    localStorage.setItem(getAppThemeStorageKey('admin'), mode);
    applyTheme(mode);
  }

  getSystemThemeQuery().addEventListener('change', () => {
    if (theme.value === 'system') applyTheme('system');
  });
  applyTheme();

  return {
    theme,
    setTheme,
    applyTheme,
  };
});
