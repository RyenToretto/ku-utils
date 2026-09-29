/// <reference types="vite/client" />

import type { AxiosInstance } from 'axios';

declare global {
  interface ImportMetaEnv {
    readonly VITE_APP_PROJECT_NAME: string;
    readonly VITE_APP_PORT: string;
    readonly VITE_APP_PUBLIC_PATH: string;
    readonly VITE_APP_API_BASE_URL: string;
    readonly VITE_APP_API_PROXY: string;
    readonly VITE_USE_MOCK: string;
    readonly VITE_APP_USE_EXAMPLE: string;
    readonly VITE_LOGIN_URL?: string;
    readonly BASE_URL: string;
  }

  interface Window {
    axios?: AxiosInstance;
  }
}

export {};
