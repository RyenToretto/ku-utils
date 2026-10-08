import type { Route } from '@angular/router';

import type { AppRouteData } from '@/types/route-data';

type AuthRouteInfo = {
  name?: string;
  permission?: string;
  children?: Array<{ permission?: string }>;
};

/**
 * 路由权限表（对齐 kr `maps/common/authRoute`）。
 * 由 `router/routes.ts` 遍历路由树登记；判权时传入当前账号权限码。
 */
class AuthRoute {
  authMap: Record<string, AuthRouteInfo> = {};

  clearState = () => {
    this.authMap = {};
  };

  authedRouteName = (routeName: string, permissions: readonly string[]) => {
    const routeInfo = this.authMap[routeName];
    if (!routeName || !routeInfo) return false;
    const isAuthed = routeInfo.permission ? permissions.includes(routeInfo.permission) : true;

    if (routeInfo.children?.length) {
      if (!isAuthed) return false;
      return routeInfo.children.some((child) => {
        if (!child.permission) return true;
        return permissions.includes(child.permission);
      });
    }
    return isAuthed;
  };

  setAuthedRoute = (route: Route) => {
    const data = (route.data || {}) as AppRouteData;
    const name = data['routeName'] as string | undefined;
    if (!name) return;
    this.authMap[name] = {
      name,
      permission: data.permission,
      children: (route.children || []).map((child) => ({
        permission: ((child.data || {}) as AppRouteData).permission,
      })),
    };
  };
}

const authRoute = new AuthRoute();

export default authRoute;
