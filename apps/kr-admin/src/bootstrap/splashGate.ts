/** 启动 Splash 门闩：关闭前路由不触发 NProgress，避免顶栏条/转圈抢戏 */
let splashGateOpen = true;

/** 首屏内联 Splash 出现时刻（模块加载 ≈ HTML 解析后），用于最短展示 */
const splashShownAt = typeof performance !== 'undefined' ? performance.now() : Date.now();

/** bootstrap（含 fetchUserInfo）完成前，authLoader 不得做未登录跳转 */
let appBootstrapped = false;
const bootstrapWaiters: Array<() => void> = [];

export function isSplashGateOpen(): boolean {
  return splashGateOpen;
}

export function closeSplashGate(): void {
  splashGateOpen = false;
}

export function getSplashShownAt(): number {
  return splashShownAt;
}

export function markAppBootstrapped(): void {
  appBootstrapped = true;
  while (bootstrapWaiters.length) {
    bootstrapWaiters.shift()?.();
  }
}

export function isAppBootstrapped(): boolean {
  return appBootstrapped;
}

export function whenAppBootstrapped(): Promise<void> {
  if (appBootstrapped) return Promise.resolve();
  return new Promise((resolve) => {
    bootstrapWaiters.push(resolve);
  });
}
