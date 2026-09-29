import type { IncomingMessage } from 'node:http';

import type { MockFileResponse } from '../../../src/mock/_types';

export function isMockFileResponse(value: unknown): value is MockFileResponse {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<MockFileResponse>;
  return (
    candidate.type === 'file' &&
    typeof candidate.filename === 'string' &&
    typeof candidate.contentType === 'string' &&
    typeof candidate.body === 'string'
  );
}

export function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk: Buffer) => {
      raw += chunk.toString();
    });
    req.on('end', () => {
      if (raw.length === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw) as Record<string, unknown>);
      } catch {
        const contentType = String(req.headers['content-type'] || '');
        if (contentType.includes('application/x-www-form-urlencoded')) {
          resolve(Object.fromEntries(new URLSearchParams(raw)));
          return;
        }
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}
