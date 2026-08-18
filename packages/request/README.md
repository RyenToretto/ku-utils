# @ku-utils/request

> 基于 Axios 的 HTTP 请求封装，内置拦截器、重试、取消等能力。

## 安装

```bash
pnpm add @ku-utils/request
```

## 使用

```ts
import { createRequest } from '@ku-utils/request';

const http = createRequest({
  baseURL: '/api',
  timeout: 10000,
});

const data = await http.get('/users');
```

## 安装源

发布于 npmjs.org，直接 `pnpm add` 即可。

---

详细文档请参考 [ku-utils 文档站](../../docs/)
