import { DestroyRef, inject, Injectable, signal } from '@angular/core';

import { getAppThemeStorageKey, THEME_MODES, type ThemeMode } from '@/utils/theme';

function getSystemThemeQuery() {
  return window.matchMedia('(prefers-color-scheme: dark)');
}

function getStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(getAppThemeStorageKey('admin')) as ThemeMode | null;
  return stored && THEME_MODES.includes(stored) ? stored : 'light';
}

/** 外观（对齐 kr `stores/app.ts`）：light / dark / system，落 `admin_thm` 并切 `html.dark` */
@Injectable({ providedIn: 'root' })
export class AppStore {
  private readonly themeState = signal<ThemeMode>(getStoredTheme());
  readonly theme = this.themeState.asReadonly();

  constructor() {
    const query = getSystemThemeQuery();
    const onSystemChange = () => {
      if (this.themeState() === 'system') this.applyTheme('system');
    };
    query.addEventListener('change', onSystemChange);
    inject(DestroyRef).onDestroy(() => query.removeEventListener('change', onSystemChange));
  }

  applyTheme(mode: ThemeMode = this.themeState()) {
    const isDark = mode === 'dark' || (mode === 'system' && getSystemThemeQuery().matches);
    document.documentElement.classList.toggle('dark', isDark);
  }

  setTheme(mode: ThemeMode) {
    this.themeState.set(mode);
    localStorage.setItem(getAppThemeStorageKey('admin'), mode);
    this.applyTheme(mode);
  }
}
