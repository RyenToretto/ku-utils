import { dismissInlineAppSplash } from './removeInlineAppSplash';
import { closeSplashGate } from './splashGate';

/** mount 后保留内联 Splash 盖住应用；就绪后再 dismiss（见 useSplashReadiness） */
export function mountAppWithSplashHandoff<T>(mountApp: () => T): T {
  return mountApp();
}

/** 无 AppSplash 的页面（无权限/错误页）：mount 后淡出内联 Splash 并放开 NProgress 门闩 */
export async function mountAndDismissSplash<T>(mountApp: () => T): Promise<T> {
  const app = mountApp();
  await dismissInlineAppSplash();
  closeSplashGate();
  return app;
}
