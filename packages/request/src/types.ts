import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

export interface RequestInterceptors {
  requestInterceptor?: (
    config: InternalAxiosRequestConfig,
  ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
  requestInterceptorCatch?: (error: unknown) => unknown;
  responseInterceptor?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
  responseInterceptorCatch?: (error: unknown) => unknown;
}

export interface RequestConfig extends AxiosRequestConfig {
  interceptors?: RequestInterceptors;
  retry?: number;
  retryDelay?: number;
  loading?: boolean;
  cancelDuplicate?: boolean;
  /** 内部重试计数，由拦截器维护 */
  __retryCount?: number;
}

export interface RequestInstance {
  instance: AxiosInstance;
  get: <T = unknown>(url: string, config?: RequestConfig) => Promise<T>;
  post: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) => Promise<T>;
  put: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) => Promise<T>;
  patch: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) => Promise<T>;
  delete: <T = unknown>(url: string, config?: RequestConfig) => Promise<T>;
  upload: <T = unknown>(
    url: string,
    file: File | FormData,
    config?: RequestConfig & { onProgress?: (percent: number) => void },
  ) => Promise<T>;
  cancelAll: () => void;
}
