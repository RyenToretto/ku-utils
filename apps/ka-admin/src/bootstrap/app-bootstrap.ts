import { inject, Injectable, signal } from '@angular/core';

import { markAppBootstrapped } from './splash-gate';

import { ApiError } from '@/api/envelope';
import { MODULE_PERMISSION_KEYS } from '@/maps/common/dsp-permission';
import { resolveBusinessHomePath } from '@/router/paths';
import { UserStore } from '@/stores/user';
import {
  consumeLogoutNext,
  consumePostLoginReturnPath,
  isUnauthorizedBusinessCode,
  isUserInfoMissingLocalUserCode,
  redirectToLogin,
} from '@/utils/auth-redirect';
import {
  ACCOUNT_EXCEPTION_PATH,
  isAuthStatusDebugPreviewAtBoot,
  isAuthStatusPath,
  LOGGED_OUT_PATH,
} from '@/utils/auth-status';
import { doEnv } from '@/utils/env';

/**
 * 启动结果：
 * - `routed`：挂路由壳（含状态页）
 * - `tip`：未知错误，整页渲染 ErrorPage（不挂路由壳）
 * - `halt`：已整页跳 OIDC，什么都不渲染
 */
export type BootMode = 'routed' | 'tip' | 'halt';

function extractErrorCode(err: unknown): string | number | null {
  if (!err || typeof err !== 'object') return null;
  const anyErr = err as { code?: number | string; payload?: { code?: number | string } };
  if (anyErr.code != null && anyErr.code !== '') return anyErr.code;
  const bodyCode = anyErr.payload?.code;
  if (bodyCode != null && bodyCode !== '') return bodyCode;
  return null;
}

function isUnauthorizedError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const anyErr = err as ApiError;
  if (anyErr.message === 'unauthorized') return true;
  if (anyErr.status === 401) return !isUserInfoMissingLocalUserCode(anyErr.code);
  return isUnauthorizedBusinessCode(anyErr.code);
}

function isUserNotProvisionedError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const anyErr = err as ApiError;
  if (anyErr.message === 'user-not-provisioned') return true;
  return isUserInfoMissingLocalUserCode(anyErr.code);
}

function isForbiddenError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  return err.status === 403 || err.code === 1404;
}

function replacePath(targetPath: string) {
  if (window.location.pathname !== targetPath) {
    window.history.replaceState(window.history.state, '', targetPath);
  }
}

/**
 * 应用启动（对齐 kr `main.tsx` bootstrap）：拉账号 → 判权 → 回原页 / 状态页 / 错误页。
 * 作为 `provideAppInitializer` 运行，路由首航在其完成之后才开始。
 */
@Injectable({ providedIn: 'root' })
export class AppBootstrap {
  private readonly userStore = inject(UserStore);
  private readonly modeState = signal<BootMode>('routed');
  private readonly tipCodeState = signal<string | number | null>(null);

  readonly mode = this.modeState.asReadonly();
  readonly tipCode = this.tipCodeState.asReadonly();

  private hasAnyModulePermission(): boolean {
    return MODULE_PERMISSION_KEYS.some((key) => this.userStore.hasPermission(key));
  }

  private routed(targetPath?: string) {
    if (targetPath) replacePath(targetPath);
    this.modeState.set('routed');
    markAppBootstrapped();
  }

  async run(): Promise<void> {
    if (isAuthStatusDebugPreviewAtBoot()) {
      this.routed();
      return;
    }

    try {
      try {
        await this.userStore.fetchUserInfo();
      } catch (firstErr) {
        if (
          isUnauthorizedError(firstErr) ||
          isForbiddenError(firstErr) ||
          isUserNotProvisionedError(firstErr)
        ) {
          throw firstErr;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 400));
        await this.userStore.fetchUserInfo();
      }

      if (!this.hasAnyModulePermission()) {
        this.userStore.markNoPermissionDenied();
        this.routed(ACCOUNT_EXCEPTION_PATH);
        return;
      }

      const postLoginReturn = consumePostLoginReturnPath();
      if (
        postLoginReturn &&
        postLoginReturn !== window.location.pathname &&
        !isAuthStatusPath(postLoginReturn)
      ) {
        replacePath(postLoginReturn);
      } else if (window.location.pathname === '/' || window.location.pathname === '') {
        replacePath(resolveBusinessHomePath());
      }

      this.routed();
    } catch (err) {
      console.error(err);
      if (isUnauthorizedError(err)) {
        const logoutNext = consumeLogoutNext();
        if (logoutNext === 'logged-out') {
          this.routed(LOGGED_OUT_PATH);
          return;
        }
        if (logoutNext === 'login') {
          this.modeState.set('halt');
          markAppBootstrapped();
          redirectToLogin();
          return;
        }
        // Mock 本地无 OIDC：落到已退出页，避免 Splash 卡死 /login 死循环
        if (doEnv.useMock) {
          this.routed(LOGGED_OUT_PATH);
          return;
        }
        this.modeState.set('halt');
        markAppBootstrapped();
        return;
      }
      if (isUserNotProvisionedError(err)) {
        this.userStore.markAccessDeniedFromError(err);
        this.routed(ACCOUNT_EXCEPTION_PATH);
        return;
      }
      if (isForbiddenError(err)) {
        this.userStore.markAccessDenied({
          code: extractErrorCode(err) ?? undefined,
          detail: '当前账号无访问权限',
        });
        this.routed(ACCOUNT_EXCEPTION_PATH);
        return;
      }
      this.tipCodeState.set(extractErrorCode(err));
      this.modeState.set('tip');
      markAppBootstrapped();
    }
  }
}
