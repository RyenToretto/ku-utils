export type ThemeMode = 'light' | 'dark' | 'system';
export type AppStorageId = 'admin';

export const THEME_OPTIONS: Array<{ value: ThemeMode }> = [
  { value: 'light' },
  { value: 'dark' },
  { value: 'system' },
];

export const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system'];

export function getAppThemeStorageKey(appId: AppStorageId): string {
  return `${appId}_thm`;
}

/** 在 DOM 初始化前（避免 FOUC）同步应用明暗主题 */
export function applyInitialTheme(appId: AppStorageId = 'admin') {
  const savedTheme = localStorage.getItem(getAppThemeStorageKey(appId)) ?? 'light';
  const isDark =
    savedTheme === 'dark' ||
    (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
}
