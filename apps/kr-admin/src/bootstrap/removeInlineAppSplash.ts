export const INLINE_APP_SPLASH_ID = 'app-inline-splash';

const SPLASH_LEAVE_MS = 200;

/** 立即摘掉（无动画），一般仅兜底 */
export function removeInlineAppSplash(): void {
  document.getElementById(INLINE_APP_SPLASH_ID)?.remove();
}

/** 淡出后移除：全程只保留 HTML 内联 Splash，避免与 Vue 双层交接闪烁 */
export function dismissInlineAppSplash(): Promise<void> {
  const el = document.getElementById(INLINE_APP_SPLASH_ID);
  if (!el) return Promise.resolve();

  if (el.classList.contains('is-leaving')) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, SPLASH_LEAVE_MS);
    });
  }

  el.classList.add('is-leaving');
  return new Promise((resolve) => {
    window.setTimeout(() => {
      el.remove();
      resolve();
    }, SPLASH_LEAVE_MS);
  });
}
