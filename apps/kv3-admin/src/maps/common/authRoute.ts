import { useUserStore } from '@/stores/user';

class AuthRoute {
  authMap: Record<string, { name?: string; meta?: { permission?: string }; children?: unknown[] }> =
    {};

  clearState = () => {
    this.authMap = {};
  };

  authedRouteName = (routeName: string) => {
    const routeInfo = this.authMap[routeName];
    if (!routeName || !routeInfo) {
      return false;
    }
    const permissions = useUserStore().permissions;
    const isAuthed = routeInfo.meta?.permission
      ? permissions.includes(routeInfo.meta.permission)
      : true;

    if (routeInfo.children && Array.isArray(routeInfo.children) && routeInfo.children.length) {
      if (!isAuthed) return false;
      return (routeInfo.children as Array<{ meta?: { permission?: string } }>).some((eachChild) => {
        const existAuthKey = eachChild.meta?.permission;
        if (!existAuthKey) return true;
        return permissions.includes(existAuthKey);
      });
    }
    return isAuthed;
  };

  setAuthedRouteName = (evt: {
    name?: string;
    meta?: { permission?: string };
    children?: unknown[];
  }) => {
    if (!evt || !evt.name) return;
    this.authMap[evt.name] = evt;
  };
}

const authRoute = new AuthRoute();

export default authRoute;
