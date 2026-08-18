import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import type { RequestConfig, RequestInstance } from './types';

export function createRequest(config: RequestConfig = {}): RequestInstance {
  const { interceptors, retry = 0, retryDelay = 1000, ...axiosConfig } = config;

  const instance: AxiosInstance = axios.create({
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    ...axiosConfig,
  });

  const pendingMap = new Map<string, AbortController>();

  function getRequestKey(config: InternalAxiosRequestConfig): string {
    return `${config.method}:${config.url}:${JSON.stringify(config.params)}:${JSON.stringify(config.data)}`;
  }

  function addPending(config: InternalAxiosRequestConfig) {
    const key = getRequestKey(config);
    if (pendingMap.has(key)) {
      pendingMap.get(key)!.abort();
    }
    const controller = new AbortController();
    config.signal = controller.signal;
    pendingMap.set(key, controller);
  }

  function removePending(config: InternalAxiosRequestConfig) {
    const key = getRequestKey(config);
    pendingMap.delete(key);
  }

  instance.interceptors.request.use(
    (reqConfig: InternalAxiosRequestConfig) => {
      if ((reqConfig as RequestConfig).cancelDuplicate !== false) {
        addPending(reqConfig);
      }
      return interceptors?.requestInterceptor
        ? interceptors.requestInterceptor(reqConfig)
        : reqConfig;
    },
    (error) => {
      return interceptors?.requestInterceptorCatch
        ? interceptors.requestInterceptorCatch(error)
        : Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      removePending(response.config as InternalAxiosRequestConfig);
      return interceptors?.responseInterceptor
        ? interceptors.responseInterceptor(response)
        : response;
    },
    async (error) => {
      if (error.config) {
        removePending(error.config);
      }

      const cfg = error.config as RequestConfig | undefined;
      const maxRetry = cfg?.retry ?? retry;
      if (maxRetry > 0 && cfg) {
        cfg.__retryCount = (cfg.__retryCount ?? 0) + 1;
        if (cfg.__retryCount <= maxRetry) {
          await new Promise((resolve) => setTimeout(resolve, cfg.retryDelay ?? retryDelay));
          return instance(cfg);
        }
      }

      return interceptors?.responseInterceptorCatch
        ? interceptors.responseInterceptorCatch(error)
        : Promise.reject(error);
    },
  );

  function request<T>(config: RequestConfig): Promise<T> {
    return instance(config).then((res) => res.data as T);
  }

  return {
    instance,
    get: <T = unknown>(url: string, config?: RequestConfig) =>
      request<T>({ ...config, url, method: 'GET' }),
    post: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
      request<T>({ ...config, url, data, method: 'POST' }),
    put: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
      request<T>({ ...config, url, data, method: 'PUT' }),
    patch: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
      request<T>({ ...config, url, data, method: 'PATCH' }),
    delete: <T = unknown>(url: string, config?: RequestConfig) =>
      request<T>({ ...config, url, method: 'DELETE' }),
    upload: <T = unknown>(
      url: string,
      file: File | FormData,
      config?: RequestConfig & { onProgress?: (percent: number) => void },
    ) => {
      const formData =
        file instanceof FormData
          ? file
          : (() => {
              const fd = new FormData();
              fd.append('file', file);
              return fd;
            })();
      return request<T>({
        ...config,
        url,
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total && config?.onProgress) {
            config.onProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      });
    },
    cancelAll: () => {
      pendingMap.forEach((controller) => controller.abort());
      pendingMap.clear();
    },
  };
}
