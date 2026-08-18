# Request HTTP 请求

`@ku-utils/request` 在 Axios 之上提供 `createRequest`：统一超时与头、可选重复请求取消、重试与上传进度等。

## 安装

```bash
pnpm add @ku-utils/request
```

## 使用示例

```typescript
import { createRequest } from '@ku-utils/request';

const http = createRequest({
  baseURL: '/api',
  retry: 2,
  retryDelay: 1000,
  interceptors: {
    requestInterceptor: (config) => {
      // 注入 Token 等
      return config;
    },
    responseInterceptorCatch: (error) => Promise.reject(error),
  },
});

const user = await http.get<{ name: string }>('/user/profile');
```

## `createRequest(config?)`

- 入参 `RequestConfig` 继承 `AxiosRequestConfig`，并扩展：
  - `interceptors`：请求/响应拦截与错误处理
  - `retry` / `retryDelay`：失败重试（默认取自顶层配置）
  - `cancelDuplicate`：是否取消重复请求（默认 `true`）
- 返回 `RequestInstance`：
  - `instance`：原始 `AxiosInstance`
  - `get` / `post` / `put` / `patch` / `delete`：返回 **响应体 data**（非完整 `AxiosResponse`）
  - `upload`：支持 `File` 或 `FormData`，可选 `onProgress`
  - `cancelAll`：中止所有进行中的请求

类型可从包中导入：`RequestConfig`、`RequestInterceptors`、`RequestInstance`。
