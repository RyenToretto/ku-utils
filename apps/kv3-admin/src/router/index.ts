import exampleRoutes from '@example-routes';
import NProgress from 'nprogress';
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import { isSplashGateOpen } from '@/bootstrap/splashGate';
import authRoute from '@/maps/common/authRoute';
import { MODULE_PERMISSION_KEYS } from '@/maps/common/dspPermission';
import { useUserStore } from '@/stores/user';
import { consumeLogoutNext, redirectToLogin } from '@/utils/authRedirect';
import {
  ACCOUNT_EXCEPTION_PATH,
  LOGGED_OUT_PATH,
  isAuthStatusDebugPreview,
  isAuthStatusPath,
} from '@/utils/authStatus';
import { doEnv } from '@/utils/env';
import AccountException from '@/views/AccountException.vue';
import ErrorPage from '@/views/ErrorPage.vue';
import LoggedOut from '@/views/LoggedOut.vue';

NProgress.configure({ showSpinner: false });

const HOME_PATH = '/example';

function hasAnyModulePermission(): boolean {
  const userStore = useUserStore();
  return MODULE_PERMISSION_KEYS.some((key) => userStore.hasPermission(key));
}

function resolveBusinessHomePath(): string {
  return HOME_PATH;
}

const routes: RouteRecordRaw[] = [
  {
    path: ACCOUNT_EXCEPTION_PATH,
    name: 'AccountException',
    component: AccountException,
    meta: { hideHeader: true },
  },
  {
    path: LOGGED_OUT_PATH,
    name: 'LoggedOut',
    component: LoggedOut,
    meta: { hideHeader: true },
  },
  {
    path: '/',
    name: 'RootRedirect',
    redirect: () => resolveBusinessHomePath(),
  },
  {
    path: '/no-permission',
    name: 'NoPermission',
    redirect: ACCOUNT_EXCEPTION_PATH,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: ErrorPage,
  },
];

if (doEnv.VITE_APP_USE_EXAMPLE) {
  routes.splice(routes.length - 2, 0, ...exampleRoutes);
}

function walkSetAuth(routeList: RouteRecordRaw[]) {
  for (const each of routeList) {
    authRoute.setAuthedRouteName(
      each as { name?: string; meta?: { permission?: string }; children?: unknown[] },
    );
    if (each.children?.length) {
      walkSetAuth(each.children);
    }
  }
}
walkSetAuth(routes);

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

function routePermissionMatch(to: { matched: Array<{ meta: Record<string, unknown> }> }) {
  const userStore = useUserStore();
  const permissionKeys = to.matched
    .map((v) => v.meta.permission as string | undefined)
    .filter(Boolean) as string[];
  if (permissionKeys.length === 0) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    let invalidKey = '';
    const valid = permissionKeys.every((key) => {
      const ok = userStore.permissions.includes(key);
      if (!ok) invalidKey = key;
      return ok;
    });
    if (valid) {
      resolve();
    } else {
      reject(invalidKey);
    }
  });
}

function startProgress() {
  if (!isSplashGateOpen()) {
    NProgress.start();
  }
}

router.beforeEach((to, _from, next) => {
  const goingException = to.path === ACCOUNT_EXCEPTION_PATH;
  const goingLoggedOut = to.path === LOGGED_OUT_PATH;
  const userStore = useUserStore();

  if (isAuthStatusPath(to.path) && isAuthStatusDebugPreview(to.query)) {
    startProgress();
    next();
    window.scrollTo(0, 0);
    return;
  }

  if (!userStore.isLoggedIn) {
    if (goingLoggedOut) {
      consumeLogoutNext();
      startProgress();
      next();
      window.scrollTo(0, 0);
      return;
    }
    const logoutNext = consumeLogoutNext();
    if (logoutNext === 'logged-out') {
      next({ path: LOGGED_OUT_PATH, replace: true });
      window.scrollTo(0, 0);
      return;
    }
    if (userStore.accessDenied) {
      if (!goingException) {
        next({ path: ACCOUNT_EXCEPTION_PATH, replace: true });
        window.scrollTo(0, 0);
        return;
      }
      startProgress();
      next();
      window.scrollTo(0, 0);
      return;
    }
    redirectToLogin();
    next(false);
    window.scrollTo(0, 0);
    return;
  }

  if (userStore.isLoggedIn && goingLoggedOut) {
    next({ path: resolveBusinessHomePath(), replace: true });
    window.scrollTo(0, 0);
    return;
  }

  if (userStore.accessDenied) {
    if (!goingException) {
      next({ path: ACCOUNT_EXCEPTION_PATH, replace: true });
      window.scrollTo(0, 0);
      return;
    }
    startProgress();
    next();
    window.scrollTo(0, 0);
    return;
  }

  if (userStore.isLoggedIn && !hasAnyModulePermission()) {
    userStore.markNoPermissionDenied();
    if (!goingException) {
      next({ path: ACCOUNT_EXCEPTION_PATH, replace: true });
      window.scrollTo(0, 0);
      return;
    }
    startProgress();
    next();
    window.scrollTo(0, 0);
    return;
  }

  if (goingException && userStore.isLoggedIn && hasAnyModulePermission()) {
    next({ path: resolveBusinessHomePath(), replace: true });
    window.scrollTo(0, 0);
    return;
  }

  routePermissionMatch(to)
    .then(() => {
      startProgress();
      next();
    })
    .catch(() => {
      userStore.markAccessDenied({ detail: '当前账号无此功能权限' });
      next({
        path: ACCOUNT_EXCEPTION_PATH,
        replace: true,
      });
    })
    .finally(() => {
      window.scrollTo(0, 0);
    });
});

router.afterEach(() => {
  if (!isSplashGateOpen()) {
    NProgress.done();
  }
});

export default router;
export { resolveBusinessHomePath };
