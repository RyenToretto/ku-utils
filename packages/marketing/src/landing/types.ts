/**
 * 落地页运行时参数（与 URL query 拼装的 PageParams）
 */
export interface PageParams extends Record<string, string | undefined> {
  _fbc?: string;
}

export interface LandingConfig {
  /** 包名映射，用于设备标识的 localStorage key */
  pkg: { android: string; ios: string };
  /**
   * 渠道判定条件（生成到 IIFE 中的 JS 表达式字符串）
   * 表达式中可使用 `p` 代表已解析的 URL 参数对象
   * @default "p.utm_source==='tiktok'||p.cha==='tt'"
   */
  tiktokCondition?: string;
  /**
   * 是否从 fbclid 预计算 _fbc 字段
   * @default false
   */
  deriveFbc?: boolean;
  /** URL 参数中需要忽略的 key 列表 */
  ignoreParams?: string[];
}

export interface PixelConfig {
  facebook?: {
    /** Pixel ID（可使用 Vite HTML 模板占位符如 '<%- FB_PIXEL_ID %>'） */
    pixelId: string;
    /** 是否传递 external_id（window.__DEVICE_TOKEN__） */
    useExternalId?: boolean;
  };
  tiktok?: {
    /** TikTok Pixel SDK ID */
    sdkId: string;
  };
}
