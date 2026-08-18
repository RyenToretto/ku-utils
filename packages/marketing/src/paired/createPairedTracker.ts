import type {
  ChannelMap,
  PairedChannelUnavailableInfo,
  PairedTracker,
  PairedTrackerConfig,
  TrackParams,
} from './types';

/**
 * 创建 Paired Tracker —— 多 SDK 漏斗配对上报实例
 *
 * 业务方一次调用 `tracker.track('purchase', { ... })`，内部自动按预声明的
 * `events` 映射表分发到 xh + FB Pixel + TikTok Pixel + Adjust 四个通道。
 *
 * 上报顺序：xh 业务上报 → fb → tiktok → adjust
 *   - 业务上报优先：保证业务漏斗事件量不被第三方 SDK 加载失败拖累
 *   - SDK 之间相互隔离：任一 SDK throw 不影响其他通道
 *
 * 使用示例（fe-picpopop 投放页 /start）：
 * ```ts
 * const paired = createPairedTracker({
 *   xh: (name, params, options) => $xhTracker(name, params, options),
 *   fb: createFacebookPixelAdapter(),
 *   tiktok: createTiktokPixelAdapter(),
 *   adjust: createAdjustWebAdapter(),
 *   events: {
 *     purchase: {
 *       fb: { name: 'Purchase', standard: true },
 *       tiktok: { name: 'CompletePayment', standard: true },
 *       adjust: { token: 'abc123' },
 *     },
 *     login_success: {
 *       fb: { name: 'Login', standard: false },  // Custom Event
 *       tiktok: { name: 'Login', standard: true },
 *       adjust: { token: 'def456' },
 *     },
 *   },
 * });
 *
 * paired.track('purchase', {
 *   xh: { sku_id, value, currency, transaction_id },
 *   fb: { value, currency, content_ids: [sku_id] },
 *   tiktok: { value, currency, content_id: sku_id },
 *   adjust: { revenue: value, currency },
 *   dedupeId: transaction_id,
 * });
 * ```
 */
export function createPairedTracker(config: PairedTrackerConfig): PairedTracker {
  const events: Record<string, ChannelMap> = { ...config.events };

  const log = (msg: string, ...rest: unknown[]): void => {
    if (!config.debug || typeof console === 'undefined') return;
    // eslint-disable-next-line no-console
    console.log(`[paired-tracker] ${msg}`, ...rest);
  };

  const mergeParams = (
    common: Record<string, unknown> | undefined,
    channel: Record<string, unknown> | undefined,
  ): Record<string, unknown> => {
    if (!common) return channel ?? {};
    if (!channel) return { ...common };
    return { ...common, ...channel };
  };

  const adapters = {
    fb: config.fb,
    tiktok: config.tiktok,
    adjust: config.adjust,
  };

  const reportUnavailable = (info: PairedChannelUnavailableInfo): void => {
    if (!config.onChannelUnavailable) return;
    try {
      config.onChannelUnavailable(info);
    } catch (err) {
      log(`onChannelUnavailable threw for ${info.channel} "${info.eventName}"`, err);
    }
  };

  const track = (eventName: string, params: TrackParams = {}): void => {
    const mapping = events[eventName];
    if (!mapping) {
      log(`event "${eventName}" not registered, skip`);
      return;
    }

    const dedupeId = params.dedupeId;

    // 1) 业务上报先发：保证业务漏斗最先入队（1.3.5 改为可选, 不传时跳过）
    if (config.xh) {
      try {
        const xhParams = mergeParams(params.common, params.xh);
        config.xh(
          eventName,
          xhParams,
          dedupeId ? { dedupeKey: dedupeId, dedupeTtl: params.dedupeTtl } : undefined,
        );
      } catch (err) {
        log(`xh "${eventName}" failed`, err);
      }
    }

    // 2) FB Pixel
    if (mapping.fb) {
      if (!adapters.fb) {
        reportUnavailable({ eventName, channel: 'fb', reason: 'adapter_missing' });
      } else if (!adapters.fb.isReady()) {
        reportUnavailable({ eventName, channel: 'fb', reason: 'not_ready' });
      } else {
        const fbParams = mergeParams(params.common, params.fb);
        const standard = mapping.fb.standard !== false;
        try {
          if (standard) adapters.fb.track(mapping.fb.name, fbParams, dedupeId);
          else adapters.fb.trackCustom?.(mapping.fb.name, fbParams, dedupeId);
        } catch (err) {
          log(`fb "${eventName}" failed`, err);
        }
      }
    }

    // 3) TikTok Pixel
    if (mapping.tiktok) {
      if (!adapters.tiktok) {
        reportUnavailable({ eventName, channel: 'tiktok', reason: 'adapter_missing' });
      } else if (!adapters.tiktok.isReady()) {
        reportUnavailable({ eventName, channel: 'tiktok', reason: 'not_ready' });
      } else {
        const ttParams = mergeParams(params.common, params.tiktok);
        const standard = mapping.tiktok.standard !== false;
        try {
          if (standard) adapters.tiktok.track(mapping.tiktok.name, ttParams, dedupeId);
          else adapters.tiktok.trackCustom?.(mapping.tiktok.name, ttParams, dedupeId);
        } catch (err) {
          log(`tiktok "${eventName}" failed`, err);
        }
      }
    }

    // 4) Adjust（token 模型，事件名被忽略）
    if (mapping.adjust) {
      if (!adapters.adjust) {
        reportUnavailable({ eventName, channel: 'adjust', reason: 'adapter_missing' });
      } else if (!adapters.adjust.isReady()) {
        reportUnavailable({ eventName, channel: 'adjust', reason: 'not_ready' });
      } else {
        const adjustParams = mergeParams(params.common, params.adjust);
        try {
          adapters.adjust.track(mapping.adjust.token, adjustParams, dedupeId);
        } catch (err) {
          log(`adjust "${eventName}" failed`, err);
        }
      }
    }
  };

  const registerEvent = (eventName: string, mapping: ChannelMap): void => {
    events[eventName] = mapping;
  };

  return {
    track,
    registerEvent,
    adapters,
  };
}
