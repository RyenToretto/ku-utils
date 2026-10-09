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

declare module 'element-ui/lib/locale/lang/zh-CN' {
  const lang: Record<string, unknown>;
  export default lang;
}

declare module 'element-ui/src/utils/clickoutside' {
  import type { DirectiveOptions } from 'vue';
  const clickoutside: DirectiveOptions;
  export default clickoutside;
}

declare module '*.md?raw' {
  const content: string;
  export default content;
}
