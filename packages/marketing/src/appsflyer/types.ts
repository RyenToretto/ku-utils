export interface AppsflyerConfig {
  /** OneLink 基础 URL，如 'https://novelsofa.onelink.me/x0gG/9rz10tu2' */
  oneLinkBase: string;
  /** PID 标识，默认 'metaweb_int' */
  pid?: string;
  /** App URI scheme，如 'novelsofa://mainActivity' */
  appScheme: string;
  /**
   * link_id 获取策略：
   *   'psi'：从 pMaps.psi 中截取第一个 '_' 前的部分（默认）
   *   'param'：直接从 pMaps.link_id 读取
   */
  linkIdSource?: 'psi' | 'param';
  /** deep_link_sub 的自定义映射（key → pMaps 中的字段名），覆盖默认值 */
  deepLinkSubMap?: Partial<Record<`sub${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`, string>>;
}

export interface AppsflyerSmartScriptConfig {
  /** Smart Script CDN 地址（如果自托管） */
  scriptUrl?: string;
  /** AF Web SDK 配置参数 */
  webDevKey?: string;
  oneLinkId?: string;
}

export interface AppsflyerTracker {
  buildOneLinkUrl: (pMaps: Record<string, string>, extra?: Record<string, string>) => string;
  redirect: (pMaps: Record<string, string>, isDebugger?: number) => void;
}
