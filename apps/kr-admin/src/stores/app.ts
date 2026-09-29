import { create } from 'zustand';

import { getAppThemeStorageKey, THEME_MODES, type ThemeMode } from '@/utils/theme';

function getSystemThemeQuery() {
  return window.matchMedia('(prefers-color-scheme: dark)');
}

function getStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(getAppThemeStorageKey('admin')) as ThemeMode | null;
  return stored && THEME_MODES.includes(stored) ? stored : 'light';
}

type AppState = {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  applyTheme: (mode?: ThemeMode) => void;
};

export const useAppStore = create<AppState>((set, get) => {
  const initial = getStoredTheme();

  function applyTheme(mode = get().theme) {
    const isDark = mode === 'dark' || (mode === 'system' && getSystemThemeQuery().matches);
    document.documentElement.classList.toggle('dark', isDark);
  }

  if (typeof window !== 'undefined') {
    getSystemThemeQuery().addEventListener('change', () => {
      if (get().theme === 'system') applyTheme('system');
    });
  }

  return {
    theme: initial,
    applyTheme,
    setTheme(mode) {
      set({ theme: mode });
      localStorage.setItem(getAppThemeStorageKey('admin'), mode);
      applyTheme(mode);
    },
  };
});

/** 启动时应用一次主题（bootstrap 调用） */
export function initAppTheme() {
  useAppStore.getState().applyTheme();
}
