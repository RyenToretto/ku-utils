import type { SdkAdapter } from '../types';

interface TtqInstance {
  track: (
    eventName: string,
    params?: Record<string, unknown>,
    options?: { event_id?: string },
  ) => void;
  trackCustom?: (
    eventName: string,
    params?: Record<string, unknown>,
    options?: { event_id?: string },
  ) => void;
  /** TikTok 还可能挂其他方法（page / identify 等），保持开放 */
  [key: string]: unknown;
}

interface TiktokPixelAdapterOptions {
  /** 自定义 ttq 引用（默认从 window.ttq 取） */
  ttq?: TtqInstance;
  /** 调用前钩子 */
  beforeTrack?: (eventName: string, params: Record<string, unknown>) => void;
}

/**
 * TikTok Pixel 适配器
 *
 * TikTok 标准事件白名单（截至 2026-05）：
 *   PageView / ViewContent / ClickButton / Search / AddToWishlist /
 *   AddToCart / InitiateCheckout / AddPaymentInfo / CompletePayment /
 *   PlaceAnOrder / Subscribe / CompleteRegistration / Contact / Download /
 *   SubmitForm / Login
 *
 * 不在白名单的业务自定义事件（如 Upload / GenerateSuccess 等）
 * 必须走 `ttq.trackCustom`，否则 TikTok 后台不会识别为优化目标。
 *
 * 业务方在 ChannelMap.tiktok 中通过 `standard: false` 显式指明走 custom 通道。
 */
export function createTiktokPixelAdapter(options: TiktokPixelAdapterOptions = {}): SdkAdapter {
  const resolveTtq = (): TtqInstance | null => {
    if (options.ttq) return options.ttq;
    if (typeof window === 'undefined') return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((window as any).ttq as TtqInstance) || null;
  };

  return {
    name: 'tiktok-pixel',
    isReady() {
      const ttq = resolveTtq();
      return !!ttq && typeof ttq.track === 'function';
    },
    track(eventName, params = {}, dedupeId) {
      const ttq = resolveTtq();
      if (!ttq?.track) return;
      options.beforeTrack?.(eventName, params);
      try {
        if (dedupeId) {
          ttq.track(eventName, params, { event_id: dedupeId });
        } else {
          ttq.track(eventName, params);
        }
      } catch (err) {
        if (typeof console !== 'undefined')
          console.warn('[tiktok-pixel] track failed', eventName, err);
      }
    },
    trackCustom(eventName, params = {}, dedupeId) {
      const ttq = resolveTtq();
      if (!ttq) return;
      options.beforeTrack?.(eventName, params);
      try {
        // 部分 TikTok 实现没有 trackCustom，对应 fallback 走 track（行为略有差异）
        if (typeof ttq.trackCustom === 'function') {
          if (dedupeId) ttq.trackCustom(eventName, params, { event_id: dedupeId });
          else ttq.trackCustom(eventName, params);
        } else if (typeof ttq.track === 'function') {
          if (dedupeId) ttq.track(eventName, params, { event_id: dedupeId });
          else ttq.track(eventName, params);
        }
      } catch (err) {
        if (typeof console !== 'undefined')
          console.warn('[tiktok-pixel] trackCustom failed', eventName, err);
      }
    },
  };
}
