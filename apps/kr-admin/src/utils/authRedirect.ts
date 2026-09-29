/**
 * OIDC 登录跳转与回原页（对齐 juxiao-dsp permission-login-integration）。
 * 登录/登出必须整页导航，禁止 fetch。
 */

import { isAuthStatusPath } from '@/utils/authStatus';

/** 登录前回写当前路由；BFF `return` 为主路径，本键作兜底。 */
export const POST_LOGIN_RETURN_STORAGE_KEY = 'kv3-admin:post-login-return';

/** 登出完成后前端落点：已退出页，或直接再进 OIDC（切换账号）。 */
export type LogoutNext = 'logged-out' | 'login';

export const LOGOUT_NEXT_STORAGE_KEY = 'kv3-admin:logout-next';

const DEFAULT_OIDC_LOGIN_PATH = '/login';
const DEFAULT_LOGOUT_PATH = '/logout';

/** 未登录业务码：对齐 juxiao-dsp `CommonErrorCode.UNAUTHENTICATED` = 1401 */
export const UNAUTHORIZED_BUSINESS_CODE = 1401;

/** 已 OIDC 认证但本地无账号：对齐 `USER_NOT_PROVISIONED` = 1402（勿整页重登） */
export const USER_NOT_PROVISIONED_BUSINESS_CODE = 1402;

/**
 * `GET /api/user/info` 在无 LocalUser 时，develop 现实现可能抛 `USER_NOT_FOUND` = 1406。
 * 前端按「账号未开通」同一提示页处理（合同目标码仍为 1402）。
 */
export const USER_NOT_FOUND_BUSINESS_CODE = 1406;

/**
 * 仅允许站内相对路径（防开放重定向）。
 * 允许 `/path?x=1#hash`；拒绝 `//evil`、绝对 URL、反斜杠前缀。
 */
export function sanitizeReturnPath(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const value = String(raw).trim();
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return null;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) return null;
  return value;
}

/** 当前页相对路径（含 query/hash），供 OIDC `return` 与 sessionStorage。 */
export function currentReturnPath(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

/**
 * OIDC 登录入口。
 * - 未配置 `VITE_LOGIN_URL`：同源 `/login`
 * - 已配置：完整 URL 或路径覆盖
 */
export function buildLoginUrl(returnPath?: string | null): string {
  const configured = String(import.meta.env.VITE_LOGIN_URL || '').trim();
  const base = configured || DEFAULT_OIDC_LOGIN_PATH;
  const safeReturn = sanitizeReturnPath(returnPath);
  if (!safeReturn) return base;
  const joiner = base.includes('?') ? '&' : '?';
  return `${base}${joiner}return=${encodeURIComponent(safeReturn)}`;
}

function rememberPostLoginReturn(returnPath: string): void {
  try {
    sessionStorage.setItem(POST_LOGIN_RETURN_STORAGE_KEY, returnPath);
  } catch {
    // sessionStorage 不可用时仍依赖 query `return`
  }
}

/** 读取并清除登录前保存的回跳路径（登录成功后由 bootstrap/路由调用）。 */
export function consumePostLoginReturnPath(): string | null {
  try {
    const raw = sessionStorage.getItem(POST_LOGIN_RETURN_STORAGE_KEY);
    sessionStorage.removeItem(POST_LOGIN_RETURN_STORAGE_KEY);
    return sanitizeReturnPath(raw);
  } catch {
    return null;
  }
}

export function peekLogoutNext(): LogoutNext | null {
  try {
    const raw = sessionStorage.getItem(LOGOUT_NEXT_STORAGE_KEY);
    if (raw === 'logged-out' || raw === 'login') return raw;
    return null;
  } catch {
    return null;
  }
}

export function consumeLogoutNext(): LogoutNext | null {
  try {
    const raw = sessionStorage.getItem(LOGOUT_NEXT_STORAGE_KEY);
    sessionStorage.removeItem(LOGOUT_NEXT_STORAGE_KEY);
    if (raw === 'logged-out' || raw === 'login') return raw;
    return null;
  } catch {
    return null;
  }
}

/** 未登录统一整页跳转 OIDC（禁止 fetch）。状态页不作 return，避免登出后再被带回异常页。 */
export function redirectToLogin(): void {
  const pathname = window.location.pathname;
  const ret = isAuthStatusPath(pathname) ? '/' : (sanitizeReturnPath(currentReturnPath()) ?? '/');
  rememberPostLoginReturn(ret);
  window.location.href = buildLoginUrl(ret);
}

export function isUnauthorizedBusinessCode(code: unknown): boolean {
  return code === UNAUTHORIZED_BUSINESS_CODE || code === '1401';
}

export function isUserNotProvisionedBusinessCode(code: unknown): boolean {
  return code === USER_NOT_PROVISIONED_BUSINESS_CODE || code === '1402';
}

/** `GET /api/user/info` 无 LocalUser 时 develop 可能返回 1406，与 1402 同按「未开通」提示 */
export function isUserInfoMissingLocalUserCode(code: unknown): boolean {
  return (
    isUserNotProvisionedBusinessCode(code) ||
    code === USER_NOT_FOUND_BUSINESS_CODE ||
    code === '1406'
  );
}

/**
 * RP 登出：整页 POST `/api/logout`（携带 Session Cookie）。
 * 服务端将跳转 SAS end_session 后回首页；前端再按 `next` 进入已退出页或 OIDC。禁止用 fetch。
 */
export function submitLogout(next: LogoutNext = 'logged-out'): void {
  try {
    sessionStorage.setItem(LOGOUT_NEXT_STORAGE_KEY, next);
  } catch {
    // sessionStorage 不可用时回首页后按未登录处理
  }
  const form = document.createElement('form');
  form.method = 'POST';
  const configured = String(import.meta.env.VITE_LOGOUT_URL || '').trim();
  form.action = configured || DEFAULT_LOGOUT_PATH;
  form.style.display = 'none';
  document.body.appendChild(form);
  form.submit();
}
