import type { IncomingMessage, ServerResponse } from 'node:http';

import { executeMockHandler, mockUserMessage, type MockMethod } from '../../../src/mock/_types';

import { isMockFileResponse, readBody } from './request';
import { respondJson, respondMockFile } from './response';

export async function dispatchMockApiHandlers(
  req: IncomingMessage,
  res: ServerResponse,
  url: string,
  handlers: MockMethod[],
  loadHandlers: () => Promise<void>,
): Promise<boolean> {
  if (handlers.length === 0) await loadHandlers();

  const method = (req.method || 'GET').toUpperCase();
  const qIdx = url.indexOf('?');
  const pathname = qIdx === -1 ? url : url.slice(0, qIdx);
  const queryStr = qIdx === -1 ? '' : url.slice(qIdx + 1);

  const query: Record<string, string> = {};
  if (queryStr) {
    for (const [k, v] of new URLSearchParams(queryStr)) {
      query[k] = v;
    }
  }

  for (const handler of handlers) {
    const handlerMethod = (handler.method || 'GET').toUpperCase();
    if (handlerMethod !== method) continue;

    const paramNames: string[] = [];
    const patternStr = handler.url.replace(/\/:([^/]+)/g, (_m, name: string) => {
      paramNames.push(name);
      return '/([^/]+)';
    });
    const match = pathname.match(new RegExp(`^${patternStr}$`));
    if (!match) continue;

    const params: Record<string, string> = {};
    paramNames.forEach((name, i) => {
      params[name] = decodeURIComponent(match[i + 1] ?? '');
    });

    const body = method !== 'GET' ? await readBody(req) : {};
    const execution = executeMockHandler(handler, { body, query, params });
    if (!execution.ok) {
      const userMsg = mockUserMessage(execution.error);
      process.stderr.write(
        `\x1b[33m[dsp-mock]\x1b[0m ${execution.error.kind}: ${execution.error.detail}\n`,
      );
      respondJson(res, { code: 400, message: userMsg, data: null }, 400);
      return true;
    }
    const data = execution.data;

    await new Promise((r) => setTimeout(r, 100 + Math.random() * 150));

    res.statusCode = 200;
    if (isMockFileResponse(data)) {
      respondMockFile(res, data);
    } else {
      respondJson(res, data);
    }
    return true;
  }

  return false;
}
