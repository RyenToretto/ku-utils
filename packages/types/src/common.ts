export type Nullable<T> = T | null;
import type { Ref } from 'vue';

export type MaybeRef<T> = T | Ref<T>;
export type Recordable<T = unknown> = Record<string, T>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type ValueOf<T> = T[keyof T];
export type PickRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type Awaitable<T> = T | Promise<T>;
export type Arrayable<T> = T | T[];

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  children?: SelectOption[];
}

export interface TreeNode<T = unknown> {
  id: string | number;
  label: string;
  children?: TreeNode<T>[];
  data?: T;
}

export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  permission?: string;
  hidden?: boolean;
}

export interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  email: string;
  phone: string;
  roles: string[];
  permissions: string[];
}

/**
 * 浏览器信息（getBrowserInfo 返回值）
 */
export interface BrowserInfo {
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  deviceName: string;
  dpi: number;
  lang: string;
  deviceWidth: number;
  deviceHeight: number;
  model: string;
}

/**
 * 浏览器支持检测结果
 */
export interface BrowserSupport {
  isChrome: boolean;
  isEdge: boolean;
  supportsFedCM: boolean;
}

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export type OSType = 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';

/**
 * detectDevice 的返回值（基于 768px 阈值的简单 PC/Phone 判断）
 */
export interface DeviceDetectResult {
  isPc: boolean;
  isPhone: boolean;
}

/**
 * rem 字号自适应选项
 */
export interface SetFontSizeOptions {
  designWid?: number;
  maxRatio?: number;
  maxMobileWidth?: number;
}

/**
 * 对象真实类型（getRealType 返回值）
 */
export type RealType =
  | 'boolean'
  | 'number'
  | 'string'
  | 'function'
  | 'array'
  | 'date'
  | 'regExp'
  | 'undefined'
  | 'null'
  | 'object'
  | 'asyncFunction'
  | 'window'
  | 'set'
  | 'map'
  | 'symbol'
  | 'promise';
