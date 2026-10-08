import { watch } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createJiti } from 'jiti';

import type * as DevEnvironmentModule from '../src/environments/environment.development';
import type { MockMethod } from '../src/mock/_types';

import { dispatchMockApiHandlers } from './mock/api-dispatch';
import { respondJson } from './mock/response';

type Next = (err?: unknown) => void;

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_ROOT = resolve(APP_ROOT, 'src');
const MOCK_ENTRY = resolve(SRC_ROOT, 'mock/index.ts');
const ENV_ENTRY = resolve(SRC_ROOT, 'environments/environment.development.ts');

/** 每次重载都拿最新源码：关模块缓存，保留 fs 转译缓存 */
const jiti = createJiti(import.meta.url, {
  moduleCache: false,
  alias: { '@': SRC_ROOT },
});

let handlers: MockMethod[] = [];
let handlersDirty = true;
let loadingPromise: Promise<void> | null = null;

async function loadHandlers(): Promise<void> {
  if (loadingPromise) return loadingPromise;
  loadingPromise = (async () => {
    try {
      const mod = await jiti.import<{ default: MockMethod[] }>(MOCK_ENTRY);
      const next = Array.isArray(mod.default) ? mod.default : [];
      // 原子替换：避免先清空再加载窗口期让 /api 落到 SPA
      handlers = next;
      handlersDirty = false;
      process.stdout.write(`\x1b[36m[dsp-mock]\x1b[0m ${handlers.length} handlers loaded\n`);
    } catch (err) {
      process.stderr.write(`\x1b[31m[dsp-mock]\x1b[0m Failed to load mock handlers: ${err}\n`);
      handlersDirty = true;
    } finally {
      loadingPromise = null;
    }
  })();
  return loadingPromise;
}

watch(SRC_ROOT, { recursive: true }, (_event, file) => {
  const name = String(file || '').replace(/\\/g, '/');
  if (name.includes('mock/') || name.includes('_mock/') || name.includes('_maps/')) {
    // 仅打脏标记，勿 handlers=[]，避免并发请求短暂无表
    handlersDirty = true;
  }
});

type DevEnvironment = typeof DevEnvironmentModule;

let useMockPromise: Promise<boolean> | null = null;

function resolveUseMock(): Promise<boolean> {
  useMockPromise ??= jiti.import<DevEnvironment>(ENV_ENTRY).then((mod) => mod.environment.useMock);
  return useMockPromise;
}

/**
 * 内联 mock 服务（对齐 kr `vite/plugins/dsp-mock`）— 请求出现在 Network 面板。
 *
 * 约定：凡 `/api/*` **禁止** `next()` 落到 SPA（否则 200 返回 index.html，
 * HttpClient 当成功、bootstrap 读 user/info.data 崩溃）。未命中或未就绪一律 JSON 信封。
 */
export default async function dspMockMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: Next,
): Promise<void> {
  if (!(await resolveUseMock())) {
    next();
    return;
  }

  const url = req.url || '';
  const pathname = url.split('?', 1)[0] ?? '';
  const reqMethod = (req.method || 'GET').toUpperCase();

  // Mock 登出：整页 POST /api/logout（及历史 /logout）后回首页（对齐 BFF，避免卡在 JSON）
  if ((pathname === '/api/logout' || pathname === '/logout') && reqMethod === 'POST') {
    res.statusCode = 302;
    res.setHeader('Location', '/');
    res.end();
    return;
  }

  if (!pathname.startsWith('/api/')) {
    next();
    return;
  }

  if (handlersDirty || handlers.length === 0) {
    await loadHandlers();
  }

  if (handlers.length === 0) {
    respondJson(res, { code: 503, message: 'Mock 尚未就绪，请稍后重试', data: null }, 503);
    return;
  }

  const handled = await dispatchMockApiHandlers(req, res, url, handlers);
  if (handled) return;

  // 未命中：绝不 next() 给 SPA，避免 index.html 冒充接口成功体
  respondJson(res, { code: 404, message: '接口不存在或 Mock 未注册', data: null }, 404);
}
