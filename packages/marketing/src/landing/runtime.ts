import type { PageParams } from './types';

/**
 * 运行时读取 bootstrap 脚本挂载的全局变量
 * 这些函数在 Vue/React 应用代码中使用，读取 index.html 中 IIFE 写入的值
 */

interface LandingWindow {
  isTiktok?: boolean;
  __PAGE_PARAMS__?: PageParams;
  __DEVICE_TOKEN__?: string;
  __PKG__?: string;
}

function w(): LandingWindow {
  return typeof window === 'undefined' ? {} : (window as unknown as LandingWindow);
}

export function isTiktok(): boolean {
  return !!w().isTiktok;
}

export function getLandingParams(): PageParams {
  return w().__PAGE_PARAMS__ || {};
}

export function getDeviceToken(): string {
  return w().__DEVICE_TOKEN__ || '';
}

export function getPkg(): string {
  return w().__PKG__ || '';
}

/**
 * 读取 Meta Pixel 写入的 _fbp Cookie
 * 格式：fb.subdomainIndex.creationTime.randomnumber，例如 fb.1.1596403881668.1116446470
 * 用于 Facebook CAPI / Adjust 等服务的归因匹配，未读取到时返回空字符串
 */
export function getFbp(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)_fbp=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}
