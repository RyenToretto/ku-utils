import { appendUrlParams } from '@ku-utils/utils';

/**
 * 内置 XHR 请求层（不依赖 axios）
 *
 * 选择保留内置 XHR 而不切换到 @ku-utils/request：
 *   - 支付 SDK 需轻量、零框架依赖
 *   - 兼容 IE11（不依赖 fetch / Promise polyfill 之外的运行时）
 *
 * 注意：当前实现 GET 请求也会 send(JSON.stringify(data))，与原 hela-pay 行为保持一致；
 * 部分服务器可能拒绝带 body 的 GET，使用方按业务约定调用即可。
 */

export type ResponseType = 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream';

export interface DoRequestConfig {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  responseType?: ResponseType;
}

class DoRequest {
  request<T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: DoRequestConfig,
    method = 'GET',
  ): Promise<T> {
    return new Promise((resolve) => {
      let xhr: XMLHttpRequest;
      try {
        xhr = new XMLHttpRequest();
      } catch {
        xhr = new (
          window as unknown as { ActiveXObject: new (s: string) => XMLHttpRequest }
        ).ActiveXObject('Microsoft.XMLHTTP');
      }
      const reqParams = (config && config.params) || {};
      xhr.open(method, appendUrlParams(url, reqParams as Record<string, string>), true);

      xhr.setRequestHeader('Content-Type', 'application/json');
      if (config && config.headers) {
        for (const index in config.headers) {
          xhr.setRequestHeader(index, config.headers[index]);
        }
      }
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          let json: unknown = xhr.responseText;
          try {
            json = JSON.parse(xhr.responseText);
          } catch {
            /* empty */
          }
          resolve((json || {}) as T);
        }
      };
      xhr.send(JSON.stringify(data));
    });
  }

  get<T = unknown>(url: string, config: DoRequestConfig = {}): Promise<T> {
    return this.request<T>(url, {}, config, 'GET');
  }

  post<T = unknown>(
    url: string,
    data: Record<string, unknown> = {},
    config: DoRequestConfig = {},
  ): Promise<T> {
    return this.request<T>(url, data, config, 'POST');
  }
}

interface DoRequestConstant {
  get: <T = unknown>(url: string, config?: DoRequestConfig) => Promise<T>;
  post: <T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: DoRequestConfig,
  ) => Promise<T>;

  <T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: DoRequestConfig,
    method?: string,
  ): Promise<T>;
}

const useDoRequest = (): DoRequestConstant => {
  try {
    const instance = new DoRequest();
    const doRequest = instance.request.bind(instance) as DoRequestConstant;
    doRequest.get = instance.get.bind(instance);
    doRequest.post = instance.post.bind(instance);
    return doRequest;
  } catch {
    return ((...args: unknown[]) => Promise.resolve(args[0])) as DoRequestConstant;
  }
};

export const doRequest = useDoRequest();
export default doRequest;
