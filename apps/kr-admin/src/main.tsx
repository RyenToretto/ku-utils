import '@ant-design/v5-patch-for-react-19';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import 'nprogress/nprogress.css';
import 'antd/dist/reset.css';
import '@ku-utils/r-custom-columns/style.css';
import '@ku-utils/skin';
import '@/assets/styles/antd-ku-bridge.scss';
import '@/assets/styles/index.scss';

import {
  mountAndDismissSplash,
  mountAppWithSplashHandoff,
} from '@/bootstrap/mountAppWithSplashHandoff';
import { markAppBootstrapped } from '@/bootstrap/splashGate';
import { MODULE_PERMISSION_KEYS } from '@/maps/common/dspPermission';
import '@/plugins/axios';
import router, { resolveBusinessHomePath } from '@/router';
import { initAppTheme } from '@/stores/app';
import { useUserStore } from '@/stores/user';
import {
  consumeLogoutNext,
  consumePostLoginReturnPath,
  isUnauthorizedBusinessCode,
  isUserInfoMissingLocalUserCode,
  redirectToLogin,
} from '@/utils/authRedirect';
import {
  ACCOUNT_EXCEPTION_PATH,
  LOGGED_OUT_PATH,
  isAuthStatusDebugPreviewAtBoot,
  isAuthStatusPath,
} from '@/utils/authStatus';
import { applyInitialTheme } from '@/utils/theme';
import ErrorPage from '@/views/ErrorPage';

dayjs.locale('zh-cn');
applyInitialTheme('admin');
initAppTheme();

function mountMain(node: React.ReactNode) {
  return mountAppWithSplashHandoff(() => {
    ReactDOM.createRoot(document.getElementById('app')!).render(
      <React.StrictMode>{node}</React.StrictMode>,
    );
  });
}

function extractErrorCode(err: unknown): string | number | null {
  if (!err || typeof err !== 'object') return null;
  const anyErr = err as {
    code?: number | string;
    response?: { data?: { code?: number | string } };
  };
  if (anyErr.code != null && anyErr.code !== '') return anyErr.code;
  const bodyCode = anyErr.response?.data?.code;
  if (bodyCode != null && bodyCode !== '') return bodyCode;
  return null;
}

async function mountTipPage(code?: string | number | null) {
  await mountAndDismissSplash(() => {
    ReactDOM.createRoot(document.getElementById('app')!).render(
      <React.StrictMode>
        <ErrorPage code={code ?? null} />
      </React.StrictMode>,
    );
  });
}

function isUnauthorizedError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const anyErr = err as {
    message?: string;
    response?: { status?: number; data?: { code?: number | string } };
    code?: number | string;
  };
  if (anyErr.message === 'unauthorized') return true;
  if (anyErr.response?.status === 401) {
    const bodyCode = anyErr.response?.data?.code;
    if (isUserInfoMissingLocalUserCode(bodyCode) || isUserInfoMissingLocalUserCode(anyErr.code)) {
      return false;
    }
    return true;
  }
  return isUnauthorizedBusinessCode(anyErr.code);
}

function isUserNotProvisionedError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const anyErr = err as {
    message?: string;
    response?: { status?: number; data?: { code?: number | string } };
    code?: number | string;
  };
  if (anyErr.message === 'user-not-provisioned') return true;
  if (isUserInfoMissingLocalUserCode(anyErr.code)) return true;
  if (anyErr.response?.status === 401 || anyErr.response?.status === 404) {
    return isUserInfoMissingLocalUserCode(anyErr.response?.data?.code);
  }
  return false;
}

function isForbiddenError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const anyErr = err as { response?: { status?: number }; code?: number };
  if (anyErr.response?.status === 403) return true;
  if (anyErr.code === 1404) return true;
  return false;
}

function hasAnyModulePermission(): boolean {
  const userStore = useUserStore.getState();
  return MODULE_PERMISSION_KEYS.some((key) => userStore.hasPermission(key));
}

async function bootstrap() {
  const userStore = useUserStore.getState();

  async function mountRoutedApp(targetPath?: string) {
    if (targetPath && window.location.pathname !== targetPath) {
      window.history.replaceState(window.history.state, '', targetPath);
    }
    markAppBootstrapped();
    mountMain(<RouterProvider router={router} />);
  }

  if (isAuthStatusDebugPreviewAtBoot()) {
    await mountRoutedApp();
    return;
  }

  try {
    try {
      await userStore.fetchUserInfo();
    } catch (firstErr) {
      if (
        isUnauthorizedError(firstErr) ||
        isForbiddenError(firstErr) ||
        isUserNotProvisionedError(firstErr)
      ) {
        throw firstErr;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 400));
      await useUserStore.getState().fetchUserInfo();
    }

    if (!hasAnyModulePermission()) {
      useUserStore.getState().markNoPermissionDenied();
      await mountRoutedApp(ACCOUNT_EXCEPTION_PATH);
      return;
    }

    const postLoginReturn = consumePostLoginReturnPath();
    if (
      postLoginReturn &&
      postLoginReturn !== window.location.pathname &&
      !isAuthStatusPath(postLoginReturn)
    ) {
      window.history.replaceState(window.history.state, '', postLoginReturn);
    } else if (window.location.pathname === '/' || window.location.pathname === '') {
      window.history.replaceState(window.history.state, '', resolveBusinessHomePath());
    }

    markAppBootstrapped();
    mountMain(<RouterProvider router={router} />);
  } catch (err) {
    console.error(err);
    if (isUnauthorizedError(err)) {
      const logoutNext = consumeLogoutNext();
      if (logoutNext === 'logged-out') {
        await mountRoutedApp(LOGGED_OUT_PATH);
        return;
      }
      if (logoutNext === 'login') {
        markAppBootstrapped();
        redirectToLogin();
        return;
      }
      // Mock 本地无 OIDC：落到已退出页，避免 Splash 卡死 /login 死循环
      if (String(import.meta.env.VITE_USE_MOCK || '') === 'true') {
        await mountRoutedApp(LOGGED_OUT_PATH);
        return;
      }
      markAppBootstrapped();
      return;
    }
    if (isUserNotProvisionedError(err)) {
      useUserStore.getState().markAccessDeniedFromError(err);
      await mountRoutedApp(ACCOUNT_EXCEPTION_PATH);
      return;
    }
    if (isForbiddenError(err)) {
      useUserStore.getState().markAccessDenied({
        code: extractErrorCode(err) ?? undefined,
        detail: '当前账号无访问权限',
      });
      await mountRoutedApp(ACCOUNT_EXCEPTION_PATH);
      return;
    }
    markAppBootstrapped();
    await mountTipPage(extractErrorCode(err));
  }
}
void bootstrap();
