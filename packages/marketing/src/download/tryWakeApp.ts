/**
 * 通过 scheme 唤起 App 的核心检测逻辑（包内私有函数）
 *
 * 行为：
 *   1. 调用方触发 location.href = schemeLink 后，开启 timeoutMs 定时器
 *   2. 监听 visibilitychange / pagehide：页面被遮蔽即认为唤起成功
 *   3. 定时器到期：根据耗时判定是否需要 fallback
 *      - elapsed < 2200ms：scheme 无响应，需 fallback（resolve true）
 *      - elapsed >= 2200ms：浏览器疑似已切到外部，不 fallback（resolve false）
 *
 * 通过 store 抽象 timer 持有方式，兼容两种调用模式：
 *   - module-level 防抖（appAndDownload 用）
 *   - window 全局变量防抖（startDownload 用）
 *
 * @returns Promise<boolean> true=需要 fallback；false=已唤起或被取消
 */

export interface WakeTimerStore {
  get: () => ReturnType<typeof setTimeout> | null | undefined;
  set: (t: ReturnType<typeof setTimeout> | null) => void;
}

export interface TryWakeAppOptions {
  /** 定时器持有抽象，控制并发/防抖范围 */
  store: WakeTimerStore;
  /** 等待 scheme 响应的毫秒数，默认 2000 */
  timeoutMs?: number;
  /** 判定为需要 fallback 的耗时上限，默认 2200 */
  fallbackThresholdMs?: number;
}

export function tryWakeApp(schemeLink: string, options: TryWakeAppOptions): Promise<boolean> {
  const { store, timeoutMs = 2000, fallbackThresholdMs = 2200 } = options;

  if (store.get()) return Promise.resolve(false);

  window.location.href = schemeLink;

  return new Promise<boolean>((resolve) => {
    const openTime = Date.now();
    let settled = false;
    const settle = (value: boolean): void => {
      if (settled) return;
      settled = true;
      const t = store.get();
      if (t) clearTimeout(t);
      store.set(null);
      resolve(value);
    };

    store.set(
      setTimeout(() => {
        settle(Date.now() - openTime < fallbackThresholdMs);
      }, timeoutMs),
    );

    const onHidden = (): void => {
      if (document.hidden || (document as unknown as { webkitHidden?: boolean }).webkitHidden) {
        settle(false);
      }
    };
    document.addEventListener('visibilitychange', onHidden);
    window.addEventListener('pagehide', () => settle(false));
  });
}
