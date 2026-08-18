import type { SdkAdapter } from '../types';

interface AdjustWebSDK {
  /**
   * Adjust 官方 web SDK trackEvent 签名
   * 参数 eventToken 是业务方在 Adjust 后台为每个 event 配置后获得的 6 位 token
   */
  trackEvent: (args: {
    eventToken: string;
    revenue?: number;
    currency?: string;
    callbackParams?: Array<{ key: string; value: string }>;
    partnerParams?: Array<{ key: string; value: string }>;
  }) => void;
  [key: string]: unknown;
}

interface AdjustWebAdapterOptions {
  /** 自定义 Adjust 引用（默认从 window.Adjust 取） */
  adjust?: AdjustWebSDK;
  /** 调用前钩子 */
  beforeTrack?: (token: string, params: Record<string, unknown>) => void;
}

/**
 * Adjust Web SDK 适配器
 *
 * Adjust 上报模型与 FB / TikTok 不同 —— 它不识别字符串事件名，
 * 而是用业务方在 Adjust 后台为每个事件预先配置的 **6 位 event token**。
 *
 * 因此 PairedTracker 调用此 adapter 时，`eventName` 参数会被忽略，
 * 真正用的是 `ChannelMap.adjust.token`（业务方在 events 配置中预声明）。
 *
 * `params` 中支持以下特殊字段（会被翻译成 Adjust SDK 参数）：
 *   - `revenue?: number` → revenue
 *   - `currency?: string` → currency
 *   - `callbackParams?: Record<string, string>` → callbackParams 数组形态
 *   - `partnerParams?: Record<string, string>` → partnerParams 数组形态
 */
export function createAdjustWebAdapter(options: AdjustWebAdapterOptions = {}): SdkAdapter {
  const resolveSdk = (): AdjustWebSDK | null => {
    if (options.adjust) return options.adjust;
    if (typeof window === 'undefined') return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((window as any).Adjust as AdjustWebSDK) || null;
  };

  const dictToTuples = (
    obj: Record<string, string | number> | undefined,
  ): Array<{ key: string; value: string }> | undefined => {
    if (!obj) return undefined;
    return Object.entries(obj).map(([key, value]) => ({ key, value: String(value) }));
  };

  const track = (token: string, params: Record<string, unknown> = {}, _dedupeId?: string): void => {
    const sdk = resolveSdk();
    if (!sdk?.trackEvent) return;
    if (!token) {
      if (typeof console !== 'undefined') console.warn('[adjust-web] empty eventToken, skip');
      return;
    }
    options.beforeTrack?.(token, params);
    try {
      sdk.trackEvent({
        eventToken: token,
        revenue: typeof params.revenue === 'number' ? params.revenue : undefined,
        currency: typeof params.currency === 'string' ? params.currency : undefined,
        callbackParams: dictToTuples(params.callbackParams as Record<string, string>),
        partnerParams: dictToTuples(params.partnerParams as Record<string, string>),
      });
    } catch (err) {
      if (typeof console !== 'undefined')
        console.warn('[adjust-web] trackEvent failed', token, err);
    }
  };

  return {
    name: 'adjust-web',
    isReady() {
      const sdk = resolveSdk();
      return !!sdk && typeof sdk.trackEvent === 'function';
    },
    track,
    // Adjust 没有 "自定义事件" 概念（一切事件都靠 token 区分），trackCustom 与 track 等价
    trackCustom: track,
  };
}
