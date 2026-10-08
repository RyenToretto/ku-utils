import type { Route, Routes } from '@angular/router';

import authRoute from '@/maps/common/auth-route';
import exampleRoutes from '@/modules/_example/_router';
import { authGuard } from '@/router/auth-guard';
import { resolveBusinessHomePath } from '@/router/paths';
import type { AppRouteData } from '@/types/route-data';
import { ACCOUNT_EXCEPTION_PATH, LOGGED_OUT_PATH } from '@/utils/auth-status';
import { doEnv } from '@/utils/env';

/** Angular 路由 path 不带前导 `/` */
const segment = (path: string) => path.replace(/^\/+/, '');

const baseChildren: Routes = [
  {
    path: segment(ACCOUNT_EXCEPTION_PATH),
    loadComponent: () => import('@/views/account-exception'),
    data: { routeName: 'AccountException', hideHeader: true } satisfies AppRouteData,
  },
  {
    path: segment(LOGGED_OUT_PATH),
    loadComponent: () => import('@/views/logged-out'),
    data: { routeName: 'LoggedOut', hideHeader: true } satisfies AppRouteData,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: () => resolveBusinessHomePath(),
  },
  {
    path: 'no-permission',
    redirectTo: segment(ACCOUNT_EXCEPTION_PATH),
  },
  ...(doEnv.useExample ? exampleRoutes : []),
  {
    path: '**',
    loadComponent: () => import('@/views/error-page'),
    data: { routeName: 'NotFound' } satisfies AppRouteData,
  },
];

function walkSetAuth(routeList: Routes) {
  for (const each of routeList) {
    authRoute.setAuthedRoute(each as Route);
    if (each.children?.length) walkSetAuth(each.children);
  }
}

export const routes: Routes = [
  {
    path: '',
    canActivateChild: [authGuard],
    runGuardsAndResolvers: 'always',
    children: baseChildren,
  },
];

walkSetAuth(routes);
