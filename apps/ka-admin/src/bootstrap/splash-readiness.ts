import { dismissInlineAppSplash } from './remove-inline-app-splash';
import { closeSplashGate } from './splash-gate';

/** 首个路由渲染就绪后淡出内联 Splash，并放开 NProgress 门闩（对齐 kr `useSplashReadiness`） */
export async function dismissSplashWhenReady(): Promise<void> {
  await dismissInlineAppSplash();
  closeSplashGate();
}
