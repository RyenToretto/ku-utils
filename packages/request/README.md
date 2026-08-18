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

## AI Skill

安装后自动同步至 `.cursor/skills/request/SKILL.md`，在 Cursor 对话中可按需调用：

> 使用 @ku-utils/request 的 createRequest 工厂创建和配置 HTTP 请求实例。当需要搭建项目 HTTP 层、配置拦截器、处理 token/401/重试时使用。

---

详细文档请参考 [ku-utils 文档站](../../docs/)
