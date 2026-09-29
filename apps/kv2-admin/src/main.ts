import dayjs from 'dayjs';
import { createPinia, PiniaVuePlugin, setActivePinia } from 'pinia';
import Vue, { type Component } from 'vue';
import 'dayjs/locale/zh-cn';
import 'nprogress/nprogress.css';
import '@ku-utils/v2-custom-columns/style';
import 'element-ui/lib/theme-chalk/index.css';
import '@ku-utils/skin';
import '@/assets/styles/index.scss';

import App from './App.vue';
import {
  mountAndDismissSplash,
  mountAppWithSplashHandoff,
} from './bootstrap/mountAppWithSplashHandoff';
import { registerElIcons } from './components/icons/elIcons';
import { MODULE_PERMISSION_KEYS } from './maps/common/dspPermission';
import axiosPlugin from './plugins/axios';
import { installElementUi } from './plugins/elementUiBridge';
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

Vue.config.productionTip = false;
Vue.use(PiniaVuePlugin);
installElementUi();
registerElIcons();

const pinia = createPinia();
setActivePinia(pinia);

function mountMain(create: () => Vue) {
  return mountAppWithSplashHandoff(() => create().$mount('#app'));
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
  await mountAndDismissSplash(() => {
    const tip = new Vue({
      pinia,
      render(h) {
        return h(component, { props: { code: code ?? null } });
      },
    });
    tip.$mount('#app');
    return tip;
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

function hasAnyModulePermission(userStore: ReturnType<typeof useUserStore>): boolean {
  return MODULE_PERMISSION_KEYS.some((key) => userStore.hasPermission(key));
}

async function bootstrap() {
  Vue.use(axiosPlugin as never);
  Vue.use(globalComponents as never);
  Vue.use(globalVariables as never);

  const appCtor = Vue.extend({
    pinia,
    router,
    render(h) {
      return h(App);
    },
  });

  const appStore = useAppStore(pinia);
  appStore.initThemeListeners();
  const userStore = useUserStore(pinia);

  async function mountRoutedApp(targetPath?: string) {
    if (targetPath && window.location.pathname !== targetPath) {
      window.history.replaceState(window.history.state, '', targetPath);
    }
    setupChunkErrorHandler(router);
    mountMain(() => new appCtor());
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
      await userStore.fetchUserInfo();
    }

    if (!hasAnyModulePermission(userStore)) {
      userStore.markNoPermissionDenied();
      await mountRoutedApp(ACCOUNT_EXCEPTION_PATH);
      return;
    }

    const postLoginReturn = consumePostLoginReturnPath();
    setupChunkErrorHandler(router);
    if (
      postLoginReturn &&
      postLoginReturn !== window.location.pathname &&
      !isAuthStatusPath(postLoginReturn)
    ) {
      await router.replace(postLoginReturn);
    }
    mountMain(() => new appCtor());
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
