import { inject } from '@angular/core';
import { Router, type CanActivateChildFn, type UrlTree } from '@angular/router';

import { AppBootstrap } from '@/bootstrap/app-bootstrap';
import { whenAppBootstrapped } from '@/bootstrap/splash-gate';
import { MODULE_PERMISSION_KEYS } from '@/maps/common/dsp-permission';
import { resolveBusinessHomePath } from '@/router/paths';
import { UserStore } from '@/stores/user';
import { consumeLogoutNext, redirectToLogin } from '@/utils/auth-redirect';
import {
  ACCOUNT_EXCEPTION_PATH,
  isAuthStatusDebugPreview,
  isAuthStatusPath,
  LOGGED_OUT_PATH,
} from '@/utils/auth-status';
import { doEnv } from '@/utils/env';

/**
 * 会话 / 权限守卫（对齐 kr `authLoader` / kv3 `router.beforeEach`）。
 * 挂在根路由 `canActivateChild`，每次子路由切换都会重判。
 */
export const authGuard: CanActivateChildFn = async (_childRoute, state) => {
  // inject 须在首个 await 之前（注入上下文仅同步段有效）
  const bootstrap = inject(AppBootstrap);
  const router = inject(Router);
  const userStore = inject(UserStore);

  // 等 AppBootstrap 拉完用户信息再判权，避免未登录误跳 /logged-out
  await whenAppBootstrapped();
  if (bootstrap.mode() !== 'routed') return true;

  const tree = router.parseUrl(state.url);
  const path = `/${tree.root.children['primary']?.segments.map((s) => s.path).join('/') ?? ''}`;
  const goingException = path === ACCOUNT_EXCEPTION_PATH;
  const goingLoggedOut = path === LOGGED_OUT_PATH;
  const redirect = (target: string): UrlTree => router.parseUrl(target);
  const hasAnyModulePermission = () =>
    MODULE_PERMISSION_KEYS.some((key) => userStore.hasPermission(key));

  if (isAuthStatusPath(path) && isAuthStatusDebugPreview(tree.queryParams)) return true;

  if (!userStore.isLoggedIn()) {
    if (goingLoggedOut) {
      consumeLogoutNext();
      return true;
    }
    // 已在异常页：禁止再 redirect 自身，否则守卫死循环（Splash 永不消）
    if (goingException) return true;
    const logoutNext = consumeLogoutNext();
    if (logoutNext === 'logged-out') return redirect(LOGGED_OUT_PATH);
    if (userStore.accessDenied()) return redirect(ACCOUNT_EXCEPTION_PATH);
    // Mock 无 OIDC：落到已退出页，禁止跳 /login
    if (doEnv.useMock) return redirect(LOGGED_OUT_PATH);
    redirectToLogin();
    return redirect(ACCOUNT_EXCEPTION_PATH);
  }

  if (goingLoggedOut) return redirect(resolveBusinessHomePath());

  if (userStore.accessDenied()) {
    return goingException ? true : redirect(ACCOUNT_EXCEPTION_PATH);
  }

  if (!hasAnyModulePermission()) {
    userStore.markNoPermissionDenied();
    return goingException ? true : redirect(ACCOUNT_EXCEPTION_PATH);
  }

  if (goingException) return redirect(resolveBusinessHomePath());

  return true;
};
