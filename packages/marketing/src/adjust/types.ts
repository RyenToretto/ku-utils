export interface AdjustTokenSet {
  facebook: { android: string; ios: string; combined: string };
  tiktok?: { combined: string };
}

export interface AdjustConfig {
  /** App scheme 配置 */
  schemes: { android: string; ios: string };
  /** Adjust impression 基础 URL */
  impressionBase?: string;
  /** Adjust GoLink 基础 URL */
  goLinkBase?: string;
  /** 各渠道的 Adjust token（业务层根据环境传入对应值） */
  tokens: AdjustTokenSet;
  /** Facebook 参数 */
  facebook?: {
    pixelId?: string;
    accessToken?: string;
  };
  /** TikTok 宏模板（可选覆盖默认值） */
  tiktokMacros?: Array<[string, string, string?]>;
}

export type MacroTuple = [string, string, string?];

export interface AdjustTracker {
  adjustReport: (pMaps: Record<string, string>, isDebugger?: number) => void;
  buildTrackerUrl: (pMaps: Record<string, string>, isDebugger?: number) => void;
  buildAdjDeepLink: (pMaps: Record<string, string>) => string;
  copyAdjDeepLink: (pMaps: Record<string, string>, isDebugger?: number) => Promise<string>;
}
