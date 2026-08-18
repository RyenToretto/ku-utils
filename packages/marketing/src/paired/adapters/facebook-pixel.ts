import type { SdkAdapter } from '../types';

interface FbqLike {
  (
    cmd: 'track',
    eventName: string,
    params?: Record<string, unknown>,
    options?: { eventID?: string },
  ): void;
  (
    cmd: 'trackCustom',
    eventName: string,
    params?: Record<string, unknown>,
    options?: { eventID?: string },
  ): void;
  (cmd: string, ...args: unknown[]): void;
}

interface FacebookPixelAdapterOptions {
  /** 自定义 fbq 引用（默认从 window.fbq 取）；测试 / SSR 注入用 */
  fbq?: FbqLike;
  /** 调用前的钩子（debug / 兜底） */
  beforeTrack?: (eventName: string, params: Record<string, unknown>) => void;
}

/**
 * Facebook Pixel 适配器
 *
 * 实现 `tracking-third-party-pairing.mdc` 中的 FB 通道分流规则：
 *   - 标准事件（Purchase / InitiateCheckout 等）走 `fbq('track', ...)`
 *   - 自定义事件（Upload / Login 等）走 `fbq('trackCustom', ...)`
 *
 * 业务方仍可选择不通过 PairedTracker，直接调用原 `useFacebookTracker`；
 * 此 adapter 不互斥，仅作为 PairedTracker 的统一接入点。
 */
export function createFacebookPixelAdapter(options: FacebookPixelAdapterOptions = {}): SdkAdapter {
  const resolveFbq = (): FbqLike | null => {
    if (options.fbq) return options.fbq;
    if (typeof window === 'undefined') return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((window as any).fbq as FbqLike) || null;
  };

  return {
    name: 'facebook-pixel',
    isReady() {
      return !!resolveFbq();
    },
    track(eventName, params = {}, dedupeId) {
      const fbq = resolveFbq();
      if (!fbq) return;
      options.beforeTrack?.(eventName, params);
      try {
        if (dedupeId) {
          fbq('track', eventName, params, { eventID: dedupeId });
        } else {
          fbq('track', eventName, params);
        }
      } catch (err) {
        if (typeof console !== 'undefined') console.warn('[fb-pixel] track failed', eventName, err);
      }
    },
    trackCustom(eventName, params = {}, dedupeId) {
      const fbq = resolveFbq();
      if (!fbq) return;
      options.beforeTrack?.(eventName, params);
      try {
        if (dedupeId) {
          fbq('trackCustom', eventName, params, { eventID: dedupeId });
        } else {
          fbq('trackCustom', eventName, params);
        }
      } catch (err) {
        if (typeof console !== 'undefined')
          console.warn('[fb-pixel] trackCustom failed', eventName, err);
      }
    },
  };
}
