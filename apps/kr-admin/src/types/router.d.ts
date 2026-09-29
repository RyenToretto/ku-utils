import 'react-router-dom';

import type { AppRouteHandle } from './routeHandle';

export type { AppRouteHandle } from './routeHandle';

declare module 'react-router-dom' {
  interface IndexRouteObject {
    handle?: AppRouteHandle;
  }
  interface NonIndexRouteObject {
    handle?: AppRouteHandle;
  }
}
