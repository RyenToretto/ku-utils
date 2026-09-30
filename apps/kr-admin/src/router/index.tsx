import exampleRoutes from '@example-routes';
import NProgress from 'nprogress';
import {
  createBrowserRouter,
  redirect,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router-dom';

import App from '@/App';
import { isSplashGateOpen, whenAppBootstrapped } from '@/bootstrap/splashGate';
import authRoute from '@/maps/common/authRoute';
import { MODULE_PERMISSION_KEYS } from '@/maps/common/dspPermission';
import { resolveBusinessHomePath } from '@/router/paths';
import { useUserStore } from '@/stores/user';
import type { AppRouteHandle } from '@/types/routeHandle';
import { consumeLogoutNext, redirectToLogin } from '@/utils/authRedirect';
import {
  ACCOUNT_EXCEPTION_PATH,
  LOGGED_OUT_PATH,
  isAuthStatusDebugPreview,
  isAuthStatusPath,
} from '@/utils/authStatus';
import { doEnv } from '@/utils/env';
import AccountException from '@/views/AccountException';
import ErrorPage from '@/views/ErrorPage';
import LoggedOut from '@/views/LoggedOut';

NProgress.configure({ showSpinner: false });

function hasAnyModulePermission(): boolean {
  const userStore = useUserStore.getState();
  return MODULE_PERMISSION_KEYS.some((key) => userStore.hasPermission(key));
}

function walkSetAuth(routeList: RouteObject[]) {
  for (const each of routeList) {
    const handle = (each.handle || {}) as AppRouteHandle;
    authRoute.setAuthedRouteName({
      name: typeof each.id === 'string' ? each.id : undefined,
      meta: { permission: handle.permission },
      children: each.children as unknown[],
    });
    if (each.children?.length) {
      walkSetAuth(each.children);
    }
  }
}

function startProgress() {
  if (!isSplashGateOpen()) {
    NProgress.start();
  }
}

async function authLoader({ request }: LoaderFunctionArgs) {
  // 等 main.bootstrap 拉完用户信息再判权，避免未登录误跳 /logged-out
  await whenAppBootstrapped();
  const url = new URL(request.url);
  const path = url.pathname;
  const query = Object.fromEntries(url.searchParams.entries());
  const userStore = useUserStore.getState();
  const goingException = path === ACCOUNT_EXCEPTION_PATH;
  const goingLoggedOut = path === LOGGED_OUT_PATH;

  if (isAuthStatusPath(path) && isAuthStatusDebugPreview(query)) {
    startProgress();
    return null;
  }

  if (!userStore.isLoggedIn) {
    if (goingLoggedOut) {
      consumeLogoutNext();
      startProgress();
      return null;
    }
    // 已在异常页：禁止再 redirect 自身，否则 loader 死循环（Splash 永不消）
    if (goingException) {
      startProgress();
      return null;
    }
    const logoutNext = consumeLogoutNext();
    if (logoutNext === 'logged-out') {
      throw redirect(LOGGED_OUT_PATH);
    }
    if (userStore.accessDenied) {
      throw redirect(ACCOUNT_EXCEPTION_PATH);
    }
    // Mock 无 OIDC：落到已退出页，禁止跳 /login
    if (doEnv.VITE_USE_MOCK) {
      throw redirect(LOGGED_OUT_PATH);
    }
    redirectToLogin();
    throw redirect(ACCOUNT_EXCEPTION_PATH);
  }

  if (userStore.isLoggedIn && goingLoggedOut) {
    throw redirect(resolveBusinessHomePath());
  }

  if (userStore.accessDenied) {
    if (!goingException) throw redirect(ACCOUNT_EXCEPTION_PATH);
    startProgress();
    return null;
  }

  if (userStore.isLoggedIn && !hasAnyModulePermission()) {
    userStore.markNoPermissionDenied();
    if (!goingException) throw redirect(ACCOUNT_EXCEPTION_PATH);
    startProgress();
    return null;
  }

  if (goingException && userStore.isLoggedIn && hasAnyModulePermission()) {
    throw redirect(resolveBusinessHomePath());
  }

  startProgress();
  return null;
}

const baseChildren: RouteObject[] = [
  {
    path: ACCOUNT_EXCEPTION_PATH,
    id: 'AccountException',
    element: <AccountException />,
    handle: { hideHeader: true } satisfies AppRouteHandle,
  },
  {
    path: LOGGED_OUT_PATH,
    id: 'LoggedOut',
    element: <LoggedOut />,
    handle: { hideHeader: true } satisfies AppRouteHandle,
  },
  {
    index: true,
    loader: () => redirect(resolveBusinessHomePath()),
  },
  {
    path: '/no-permission',
    loader: () => redirect(ACCOUNT_EXCEPTION_PATH),
  },
];

if (doEnv.VITE_APP_USE_EXAMPLE) {
  baseChildren.splice(baseChildren.length - 1, 0, ...(exampleRoutes as RouteObject[]));
}

baseChildren.push({
  path: '*',
  id: 'NotFound',
  element: <ErrorPage />,
});

const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    loader: authLoader,
    children: baseChildren,
  },
];

walkSetAuth(routes);

export const router = createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL || '/',
});

router.subscribe(() => {
  if (!isSplashGateOpen()) {
    NProgress.done();
  }
  window.scrollTo(0, 0);
});

export default router;
export { resolveBusinessHomePath };
