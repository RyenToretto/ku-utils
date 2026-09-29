/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_PROJECT_NAME: string;
  readonly VITE_APP_PORT: string;
  readonly VITE_APP_PUBLIC_PATH: string;
  readonly VITE_APP_API_BASE_URL: string;
  readonly VITE_APP_API_PROXY: string;
  readonly VITE_USE_MOCK: string;
  readonly VITE_APP_USE_EXAMPLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '@example-routes' {
  import type { RouteObject } from 'react-router-dom';
  const routes: RouteObject[];
  export default routes;
}

declare module '@example-maps' {
  const maps: Record<string, unknown>;
  export default maps;
}

declare module '@example-mocks' {
  const mocks: unknown;
  export default mocks;
}

declare module '@header-example-tab' {
  import type { ComponentType } from 'react';
  const Tab: ComponentType | null;
  export default Tab;
}
