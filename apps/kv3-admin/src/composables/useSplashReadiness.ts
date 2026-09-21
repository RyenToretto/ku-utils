import { ref } from 'vue';

import { dismissInlineAppSplash } from '@/bootstrap/removeInlineAppSplash';
import { closeSplashGate, getSplashShownAt } from '@/bootstrap/splashGate';

/** 最短展示，保证底部 indeterminate 进度条至少能看清一轮滑动 */
const SPLASH_MIN_VISIBLE_MS = 720;
/** 等字体就绪上限，避免拖死启动（系统字体通常即时可用） */
const SPLASH_FONT_WAIT_MS = 800;

function waitWithTimeout(promise: Promise<unknown>, ms: number): Promise<void> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(resolve, ms);
    promise.then(
      () => {
        window.clearTimeout(timer);
        resolve();
      },
      () => {
        window.clearTimeout(timer);
        resolve();
      },
    );
  });
}

async function waitForSplashFonts(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts?.ready) return;
  await waitWithTimeout(document.fonts.ready, SPLASH_FONT_WAIT_MS);
}

/**
 * Splash 显隐由 HTML 内联节点承担；此处只负责就绪条件与淡出移除。
 * 不再挂载第二层 Vue Splash，避免 class/动画/进度条交接闪烁。
 */
export function useSplashReadiness(routerReady: () => Promise<unknown>) {
  const splashVisible = ref(true);

  async function waitForRouterReady(): Promise<void> {
    try {
      await Promise.all([routerReady(), waitForSplashFonts()]);
      const elapsed = performance.now() - getSplashShownAt();
      const remain = SPLASH_MIN_VISIBLE_MS - elapsed;
      if (remain > 0) {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, remain);
        });
      }
    } finally {
      await dismissInlineAppSplash();
      splashVisible.value = false;
      closeSplashGate();
    }
  }

  return { splashVisible, waitForRouterReady };
}
