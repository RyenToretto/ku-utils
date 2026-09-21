import dayjs from 'dayjs';
import { createPinia } from 'pinia';
import { createApp, type App as VueApp, type Component } from 'vue';
import 'dayjs/locale/zh-cn';
import 'nprogress/nprogress.css';
import '@ku-utils/custom-columns/style';
import 'element-plus/es/components/message/style/css';
import 'element-plus/es/components/message-box/style/css';

import '@/assets/styles/fonts.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
// 品牌皮肤（--ku-* + --el-* 桥接）。本 starter 默认典籍风 tome，可改回 @ku-utils/skin（lark）
import '@ku-utils/skin/tome';
import '@/assets/styles/index.scss';

import App from './App.vue';
import {
  mountAndDismissSplash,
  mountAppWithSplashHandoff,
} from './bootstrap/mountAppWithSplashHandoff';
import { MODULE_PERMISSION_KEYS } from './maps/common/dspPermission';
import axiosPlugin from './plugins/axios';
import elementPlusBridge from './plugins/elementPlusBridge';
import globalComponents from './plugins/globalComponents';
import globalVariables from './plugins/globalVariables';
import router from './router';
import { useAppStore } from './stores/app';
import { useUserStore } from './stores/user';
import {
  consumeLogoutNext,
  consumePostLoginReturnPath,
  isUnauthorizedBusinessCode,
  isUserInfoMissingLocalUserCode,
  redirectToLogin,
} from './utils/authRedirect';
import {
  ACCOUNT_EXCEPTION_PATH,
  LOGGED_OUT_PATH,
  isAuthStatusDebugPreviewAtBoot,
  isAuthStatusPath,
} from './utils/authStatus';
import { setupChunkErrorHandler } from './utils/chunkErrorHandler';
import { applyInitialTheme } from './utils/theme';
import ErrorPage from './views/ErrorPage.vue';

dayjs.locale('zh-cn');
applyInitialTheme('admin');

function mountMain(create: () => VueApp<Element>) {
  return mountAppWithSplashHandoff(() => create().mount('#app'));
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

async function mountTipPage(component: Component, code?: string | number | null) {
  await mountAndDismissSplash(() =>
    createApp(component, { code: code ?? null })
      .use(createPinia())
      .use(elementPlusBridge)
      .use(globalVariables)
      .mount('#app'),
  );
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

function hasAnyModulePermission(userStore: ReturnType<typeof useUserStore>): boolean {
  return MODULE_PERMISSION_KEYS.some((key) => userStore.hasPermission(key));
}

async function bootstrap() {
  const app = createApp(App);
  app.use(createPinia());
  useAppStore();
  app.use(axiosPlugin);
  app.use(elementPlusBridge);
  app.use(globalComponents);
  app.use(globalVariables);

  const userStore = useUserStore();

  async function mountRoutedApp(targetPath?: string) {
    if (targetPath && window.location.pathname !== targetPath) {
      window.history.replaceState(window.history.state, '', targetPath);
    }
    app.use(router);
    setupChunkErrorHandler(router);
    mountMain(() => app);
  }

  if (isAuthStatusDebugPreviewAtBoot()) {
    await mountRoutedApp();
    return;
  }

  try {
    try {
      await userStore.fetchUserInfo();
    } catch (firstErr) {
      // Mock HMR / 瞬态 503：短延迟重试一次，避免偶发直接进 ErrorPage
      if (
        isUnauthorizedError(firstErr) ||
        isForbiddenError(firstErr) ||
        isUserNotProvisionedError(firstErr)
      ) {
        throw firstErr;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 400));
      await userStore.fetchUserInfo();
    }

    if (!hasAnyModulePermission(userStore)) {
      userStore.markNoPermissionDenied();
      await mountRoutedApp(ACCOUNT_EXCEPTION_PATH);
      return;
    }

    const postLoginReturn = consumePostLoginReturnPath();
    app.use(router);
    setupChunkErrorHandler(router);
    if (
      postLoginReturn &&
      postLoginReturn !== window.location.pathname &&
      !isAuthStatusPath(postLoginReturn)
    ) {
      await router.replace(postLoginReturn);
    }
    mountMain(() => app);
  } catch (err) {
    console.error(err);
    if (isUnauthorizedError(err)) {
      const logoutNext = consumeLogoutNext();
      if (logoutNext === 'logged-out') {
        await mountRoutedApp(LOGGED_OUT_PATH);
        return;
      }
      if (logoutNext === 'login') {
        redirectToLogin();
        return;
      }
      // axios 拦截器已 redirectToLogin；此处避免再挂 ErrorPage
      return;
    }
    if (isUserNotProvisionedError(err)) {
      userStore.markAccessDeniedFromError(err);
      await mountRoutedApp(ACCOUNT_EXCEPTION_PATH);
      return;
    }
    if (isForbiddenError(err)) {
      userStore.markAccessDenied({
        code: extractErrorCode(err) ?? undefined,
        detail: '当前账号无访问权限',
      });
      await mountRoutedApp(ACCOUNT_EXCEPTION_PATH);
      return;
    }
    await mountTipPage(ErrorPage, extractErrorCode(err));
  }
}

void bootstrap();
