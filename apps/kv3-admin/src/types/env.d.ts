/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_PROJECT_NAME: string;
  readonly VITE_APP_PORT: string;
  readonly VITE_APP_PUBLIC_PATH: string;
  readonly VITE_APP_API_BASE_URL: string;
  readonly VITE_APP_API_PROXY: string;
  readonly VITE_USE_MOCK: string;
  readonly VITE_APP_USE_EXAMPLE: string;
  readonly VITE_LOGIN_URL?: string;
  readonly VITE_LOGOUT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare module '*.md?raw' {
  const content: string;
  export default content;
}
