/**
 * SSO 状态页路径与静态预览。
 * 已登录但业务账号异常 ≠ 未登录；主动退出后应落到已退出页，禁止立刻再跳 OIDC。
 */

export const ACCOUNT_EXCEPTION_PATH = '/account-exception';

export const LOGGED_OUT_PATH = '/logged-out';

/** 状态页静态预览：`?_debug=1` 时跳过会话探测与跳转。 */
export const AUTH_STATUS_DEBUG_QUERY = '_debug';

export function isAuthStatusPath(path: string): boolean {
  const pathname = path.split('?')[0] ?? path;
  return pathname === ACCOUNT_EXCEPTION_PATH || pathname === LOGGED_OUT_PATH;
}

export function isAuthStatusDebugPreview(query: { readonly [key: string]: unknown }): boolean {
  const raw = query[AUTH_STATUS_DEBUG_QUERY];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === '1';
}

/** 冷启动时根据浏览器 URL 判断是否为状态页静态预览。 */
export function isAuthStatusDebugPreviewAtBoot(): boolean {
  try {
    const url = new URL(window.location.href);
    return isAuthStatusPath(url.pathname) && url.searchParams.get(AUTH_STATUS_DEBUG_QUERY) === '1';
  } catch {
    return false;
  }
}
