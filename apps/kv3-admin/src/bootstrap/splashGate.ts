/** 启动 Splash 门闩：关闭前路由不触发 NProgress，避免顶栏条/转圈抢戏 */
let splashGateOpen = true;

/** 首屏内联 Splash 出现时刻（模块加载 ≈ HTML 解析后），用于最短展示 */
const splashShownAt = typeof performance !== 'undefined' ? performance.now() : Date.now();

export function isSplashGateOpen(): boolean {
  return splashGateOpen;
}

export function closeSplashGate(): void {
  splashGateOpen = false;
}

export function getSplashShownAt(): number {
  return splashShownAt;
}
