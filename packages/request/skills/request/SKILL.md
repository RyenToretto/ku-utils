---
name: request
description: 使用 @ku-utils/request 的 createRequest 工厂创建和配置 HTTP 请求实例。当需要搭建项目 HTTP 层、配置拦截器、处理 token/401/重试时使用。
---

# @ku-utils/request Skill

基于 Axios 的 HTTP 请求工厂，内置重复请求取消、重试、拦截器链。

## 安装

```bash
npm install @ku-utils/request axios
```

## createRequest 配置

```ts
import { createRequest } from '@ku-utils/request';
import type { RequestConfig } from '@ku-utils/request';

const http = createRequest({
  // Axios 原生配置
  baseURL: '/api',
  timeout: 15000,
  headers: { 'X-App-Version': '1.0.0' },

  // 请求重试（网络错误时）
  retry: 2,
  retryDelay: 1000,

  // 拦截器
  interceptors: {
    requestInterceptor(config) {
      config.headers.Authorization = `Bearer ${getToken()}`;
      return config;
    },
    requestInterceptorCatch(error) {
      return Promise.reject(error);
    },
    responseInterceptor(response) {
      // 解包业务数据
      return response.data;
    },
    responseInterceptorCatch(error) {
      const status = error.response?.status;
      if (status === 401) router.push('/login');
      if (status === 403) message.error('无权限');
      return Promise.reject(error);
    },
  },
});

export default http;
```

## API 调用示例

```ts
// src/api/user.ts
import http from '@/plugins/http';
import type { ApiResponse, PaginatedResponse } from '@ku-utils/types';

// GET 请求
export function getUser(id: string) {
  return http.get<ApiResponse<User>>(`/users/${id}`);
}

// POST 请求
export function createUser(data: CreateUserDto) {
  return http.post<ApiResponse<User>>('/users', data);
}

// 分页列表
export function getUserList(params: { page: number; pageSize: number }) {
  return http.get<PaginatedResponse<User>>('/users', { params });
}

// 文件上传
export function uploadAvatar(file: File) {
  const form = new FormData();
  form.append('file', file);
  return http.post<ApiResponse<{ url: string }>>('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
```

## 禁用重复请求取消

```ts
// 特定请求不取消重复（如轮询场景）
http.get('/poll-status', { cancelDuplicate: false });
```

## 完整项目初始化示例

```ts
// src/plugins/http.ts
import { createRequest } from '@ku-utils/request';
import { HttpStatus, StorageKey } from '@ku-utils/constants';
import { local } from '@ku-utils/utils';
import router from '@/router';
import { ElMessage } from 'element-plus';

export const http = createRequest({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  interceptors: {
    requestInterceptor(config) {
      const token = local.get<string>(StorageKey.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    responseInterceptor(response) {
      const { data } = response;
      if (data.code !== HttpStatus.OK && data.code !== 0) {
        ElMessage.error(data.message || '请求失败');
        return Promise.reject(new Error(data.message));
      }
      return data;
    },
    responseInterceptorCatch(error) {
      if (error.response?.status === HttpStatus.UNAUTHORIZED) {
        local.remove(StorageKey.TOKEN);
        router.push('/login');
      } else {
        ElMessage.error(error.message || '网络异常');
      }
      return Promise.reject(error);
    },
  },
});
```
