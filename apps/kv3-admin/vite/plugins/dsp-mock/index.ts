import type { IncomingMessage, ServerResponse } from 'node:http';

import type { Plugin, ViteDevServer } from 'vite';

import type { MockMethod } from '../../../src/mock/_types';

import { dispatchMockApiHandlers } from './api-dispatch';
import { respondJson } from './response';

/**
 * 内联 mock 服务插件 — 使请求出现在 Network 面板。
 * 使用 ssrLoadModule 加载 src/mock/index.ts，支持 HMR。
 *
 * 约定：凡 `/api/*` **禁止** `next()` 落到 Vite SPA（否则会 200 返回 index.html，
 * 导致 axios 当成功、bootstrap 读 user/info.data 崩溃）。未命中或未就绪一律 JSON 信封。
 */
export function dspMockPlugin(enable: boolean): Plugin | false {
  if (!enable) return false;

  let handlers: MockMethod[] = [];
  let handlersDirty = true;
  let loadingPromise: Promise<void> | null = null;
  let server: ViteDevServer;

  async function loadHandlers() {
    if (loadingPromise) return loadingPromise;
    loadingPromise = (async () => {
      try {
        const mod = await server.ssrLoadModule('/src/mock/index.ts');
        const nextHandlers = Array.isArray(mod.default) ? (mod.default as MockMethod[]) : [];
        // 原子替换：避免先清空再加载窗口期让 /api 落到 SPA
        handlers = nextHandlers;
        handlersDirty = false;
        process.stdout.write(`\x1b[36m[dsp-mock]\x1b[0m ${handlers.length} handlers loaded\n`);
      } catch (err) {
        process.stderr.write(`\x1b[31m[dsp-mock]\x1b[0m Failed to load mock handlers: ${err}\n`);
        // 保留上一份可用表；保持 dirty，下次请求继续重试加载
        handlersDirty = true;
      } finally {
        loadingPromise = null;
      }
    })();
    return loadingPromise;
  }

  return {
    name: 'dsp-mock',
    configureServer(devServer) {
      server = devServer;

      devServer.watcher.on('change', (file) => {
        if (file.includes('/mock/') || file.includes('/_mock/')) {
          // 仅打脏标记，勿 handlers=[]，避免并发请求短暂无表
          handlersDirty = true;
        }
      });

      devServer.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        const url = req.url || '';
        const pathname = url.split('?', 1)[0];
        const reqMethod = (req.method || 'GET').toUpperCase();

        // Mock 登出：整页 POST /api/logout（及历史 /logout）后回首页（对齐 BFF，避免卡在 JSON）
        if ((pathname === '/api/logout' || pathname === '/logout') && reqMethod === 'POST') {
          res.statusCode = 302;
          res.setHeader('Location', '/');
          res.end();
          return;
        }

        if (!pathname.startsWith('/api/')) {
          return next();
        }

        if (handlersDirty || handlers.length === 0) {
          await loadHandlers();
        }

        if (handlers.length === 0) {
          respondJson(
            res,
            {
              code: 503,
              message: 'Mock 尚未就绪，请稍后重试',
              data: null,
            },
            503,
          );
          return;
        }

        const handled = await dispatchMockApiHandlers(req, res, url, handlers, loadHandlers);
        if (handled) return;

        // 未命中：绝不 next() 给 SPA，避免 index.html 冒充接口成功体
        respondJson(
          res,
          {
            code: 404,
            message: '接口不存在或 Mock 未注册',
            data: null,
          },
          404,
        );
      });
    },
  };
}
