export type ReportRequestFn = <T = unknown>(
  url: string,
  options: {
    method: string;
    params?: Record<string, unknown>;
    body?: unknown;
  },
) => Promise<T>;

export interface TrackerConfig {
  /** 包名/应用标识 */
  pkg: string;
  /** Token（可选，用于用户标识） */
  tk?: string;
  /** 版本号 */
  version?: string;
  /** 是否开发模式（开发模式下只输出日志不真实上报） */
  isDev?: boolean;
  /** 预定义的上报 key 列表 */
  keys?: string[];
  /** URL 中可映射为 ext.source 的参数名，默认支持 source */
  sourceKeys?: string[];
  /** 是否手动初始化 */
  manual?: boolean;
  /** 额外参数获取函数 */
  moreGetter?: () => Record<string, unknown>;
  /** 上报 API 地址 */
  reportUrl?: string;
  /** 属性上报 API 地址 */
  attrUrl?: string;
  /** 上报请求函数（可选，默认使用 fetch） */
  reportFetch?: ReportRequestFn;
  /** 属性上报请求函数（可选，默认使用 fetch） */
  attrFetch?: ReportRequestFn;
}

export interface ReportParams {
  channel: string;
  local: string;
  appvn: string;
  plat: string;
  app: string;
  tk: string;
  ts: number;
  manu: string;
  sysv: string;
  model?: string;
  anid?: string;
  oaid?: string;
  w?: number;
  h?: number;
  sdkvn?: string;
}

/**
 * doReport / attrReport 第三参数选项
 *
 * 兼容两种形态：
 *   - `boolean` —— 旧 `onlyOnce` 语义（按事件 key 维度的全局一次性 storage 防重）
 *   - `ReportOptions` —— 新对象语义，支持 `dedupeKey` 按业务 id 内存去重
 *
 * `dedupeKey` 与 `onlyOnce` 互不冲突，可同时启用：
 *   - `onlyOnce: true` 按 app + token 写入 storage 防重（跨页面/跨刷新）
 *   - `dedupeKey: 'xxx'` 成功后走当前页面内存防重；待发送期间由持久事件池防重
 *
 * 设计目的：业务漏斗事件按业务 id（transaction_id / orderId 等）去重，
 * 避免当前页面会话中的回跳风暴；支付跨刷新幂等仍应使用稳定 orderId。
 */
export interface ReportOptions {
  /** app + token 的 storage 一次性防重（兼容旧 boolean onlyOnce） */
  onlyOnce?: boolean;
  /** 成功后按业务 id 做当前页面内存防重；待发送期间由持久事件池防重 */
  dedupeKey?: string;
  /** dedupeKey 命中后保留多久；默认 30 分钟（足以覆盖一次回跳风暴） */
  dedupeTtl?: number;
}

/** 第三参数的联合形态 */
export type ReportOnceOrOptions = boolean | ReportOptions;

export interface TrackerInstance {
  init: (config?: TrackerConfig) => Promise<void>;
  attrReport: (
    key: string,
    ext?: Record<string, unknown>,
    onceOrOptions?: ReportOnceOrOptions,
  ) => Promise<unknown>;
  setReportFetch: (fn: ReportRequestFn) => void;
  setAttrFetch: (fn: ReportRequestFn) => void;
  makeVersionCode: (vn: string) => string;
  uuid: (pkg: string) => string;
  useToken: (pkg: string, oldToken?: string) => string;

  (
    key: string,
    ext?: Record<string, unknown>,
    onceOrOptions?: ReportOnceOrOptions,
  ): Promise<unknown>;

  [key: string]: unknown;
}
