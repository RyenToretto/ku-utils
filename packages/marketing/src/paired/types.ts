/**
 * Paired Tracker —— 多 SDK 漏斗配对上报
 *
 * 设计目标：业务漏斗事件（snake_case）一次调用 `track(eventName, params)`，
 * 由 PairedTracker 内部分发到 xh / fb / tiktok / adjust 四个通道，
 * 保证投放归因与业务漏斗事件量 1:1。
 *
 * 适用规则参考 fe-picpopop `.cursor/rules/tracking-third-party-pairing.mdc`：
 *   - 除 FB PageView 外，所有第三方上报必须与业务上报成对
 *   - 业务事件 snake_case；FB/TikTok 标准事件保留 PascalCase；自定义事件走 trackCustom
 *   - 业务上报先发，第三方 SDK 后发；任一 SDK 失败不阻断其他通道
 */

/**
 * 第三方 SDK 适配器抽象
 *
 * 实现方负责：检测 SDK 是否就绪、把通用参数翻译成 SDK 私有调用。
 * 失败兜底：方法内部捕获异常并 log，**不应该 throw** 给上层。
 */
export interface SdkAdapter {
  /** SDK 名称（用于 dev 日志） */
  readonly name: string;

  /** SDK 是否就绪（脚本已加载 / 全局变量已挂载） */
  isReady(): boolean;

  /**
   * 上报「标准事件」（如 FB 的 Purchase / TikTok 的 CompletePayment 等）
   * @param eventName 标准事件名（PascalCase）
   * @param params 业务参数（如 value / currency / content_ids 等）
   * @param dedupeId 可选；用于 SDK 自身的事件去重（FB 的 eventID 等）
   */
  track(eventName: string, params?: Record<string, unknown>, dedupeId?: string): void;

  /**
   * 上报「自定义事件」（非标准事件名）
   * @param eventName 自定义事件名（PascalCase 推荐）
   */
  trackCustom?(eventName: string, params?: Record<string, unknown>, dedupeId?: string): void;
}

/**
 * 单个业务事件的通道映射
 *
 * 各通道字段缺省即不发；同一业务事件可在不同通道用不同名字。
 */
export interface ChannelMap {
  /** FB Pixel 通道：standard=true 走 fbq('track')，false 走 fbq('trackCustom') */
  fb?: { name: string; standard?: boolean };
  /** TikTok Pixel 通道：standard=true 走 ttq.track；false 走 ttq.trackCustom */
  tiktok?: { name: string; standard?: boolean };
  /** Adjust web SDK 通道：传入业务方在 Adjust 后台配置的 event token */
  adjust?: { token: string };
}

/**
 * 业务上报回调签名
 *
 * 由业务方传入；内部按需调用 xh / attr / GA / 项目自定义上报。
 * PairedTracker 不直接依赖 @ku-utils/report，避免强耦合。
 */
export type XhReportFn = (
  eventName: string,
  params: Record<string, unknown>,
  options?: { dedupeKey?: string; dedupeTtl?: number },
) => void;

/**
 * 通道未就绪诊断信息（1.3.5 新增）
 */
export interface PairedChannelUnavailableInfo {
  /** 业务事件名（snake_case） */
  eventName: string;
  /** 哪条第三方通道未就绪 */
  channel: 'fb' | 'tiktok' | 'adjust';
  /**
   * 原因:
   *   - `adapter_missing`: PairedTrackerConfig 没传该通道的 adapter
   *   - `not_ready`: 传了 adapter 但 adapter.isReady() 返回 false
   */
  reason: 'adapter_missing' | 'not_ready';
}

/**
 * PairedTracker 配置
 */
export interface PairedTrackerConfig {
  /**
   * 业务上报回调（**1.3.5 改为可选**）
   *
   * - 不传时，paired tracker 完全不调 xh，业务方需在调用 `track()` 之前/之后自行调
   *   `$xhTracker(...)` 把关键事件发给 xh CMS（推荐姿势：业务侧已显式调过 xh）
   * - 透传时仍按旧契约：每个 `paired.track` 都同步调一次 `config.xh`，用于 "以
   *   paired 为唯一上报入口" 的项目
   *
   * 历史：1.3.4 及以前为必填。fe-picpopop 在业务 hook 里**已经显式**调过 `$xhTracker`，
   * 这里再发一份导致同一个 `sign_up` / `login_success` 在 xh CMS 被打两次（一次
   * 带业务 params，一次空 params），CMS 数量被人为放大 2 倍（1226 vs 真实约 613）。
   * 业务侧 v1.3.4 兼容用法：`xh: () => void 0` —— v1.3.5 可直接省略字段。
   */
  xh?: XhReportFn;
  /** FB Pixel 适配器（可选） */
  fb?: SdkAdapter;
  /** TikTok Pixel 适配器（可选） */
  tiktok?: SdkAdapter;
  /** Adjust web SDK 适配器（可选） */
  adjust?: SdkAdapter;
  /**
   * 事件名 → 通道映射表
   * 业务事件名（snake_case）作为 key，value 描述各通道的事件名与通道类型
   */
  events: Record<string, ChannelMap>;
  /** 开发环境日志开关（默认 false） */
  debug?: boolean;
  /**
   * 通道未就绪诊断回调（**1.3.5 新增**）
   *
   * 触发时机：某事件 mapping 配置了某通道，但该通道 adapter 缺失或
   * `isReady()` 返回 false 时触发。业务方可在此往 GA / 内部报警通道打一发诊断
   * 事件，便于发现 trusted domain 配置错误 / SDK 加载失败等隐性漏报问题。
   *
   * 注意：
   *   - 仅 mapping 存在 + 通道未就绪时触发；没配 mapping 不触发（不算"漏报"）
   *   - FB Pixel 的 trusted domain 限制场景中，fbq 已存在（isReady=true）但所有
   *     `fbq('track', ...)` 被 SDK 静默 drop，**这种"假 ready 真 drop"本回调
   *     无法捕获**，需在 fbevents.js 抛出的 `[Meta pixel] X is unavailable`
   *     console.warn 处单独拦截上报
   */
  onChannelUnavailable?: (info: PairedChannelUnavailableInfo) => void;
}

/**
 * track() 调用时的参数
 */
export interface TrackParams {
  /** 业务上报参数（snake_case key） */
  xh?: Record<string, unknown>;
  /** FB Pixel 上报参数 */
  fb?: Record<string, unknown>;
  /** TikTok Pixel 上报参数 */
  tiktok?: Record<string, unknown>;
  /** Adjust 上报回调元参数（revenue / currency 等） */
  adjust?: Record<string, unknown>;
  /**
   * 跨通道共享的业务去重 id（如 transaction_id）
   * 会传给 xh 的 dedupeKey + FB 的 eventID 等
   */
  dedupeId?: string;
  /** xh 的 dedupeTtl，默认走 @ku-utils/report 的 30 分钟 */
  dedupeTtl?: number;
  /** 通用参数（向各通道合并）；存在时与各通道独立参数 shallow merge，通道独立参数优先级更高 */
  common?: Record<string, unknown>;
}

export interface PairedTracker {
  /**
   * 业务事件分发：业务方只需调一次，内部按事件配置自动分发到 xh + 3 个 SDK 通道
   *
   * @param eventName 业务事件名（snake_case，必须在 config.events 中预先声明）
   * @param params 各通道参数 + 共享去重 id
   */
  track(eventName: string, params?: TrackParams): void;

  /**
   * 动态注册/覆盖事件配置（运行时追加新事件而无需重建实例）
   */
  registerEvent(eventName: string, mapping: ChannelMap): void;

  /** 返回内部 SDK 适配器（用于业务方做单独的非常规调用） */
  readonly adapters: {
    fb?: SdkAdapter;
    tiktok?: SdkAdapter;
    adjust?: SdkAdapter;
  };
}
