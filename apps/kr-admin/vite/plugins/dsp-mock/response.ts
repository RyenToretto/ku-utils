import type { ServerResponse } from 'node:http';

import type { MockFileResponse } from '../../../src/mock/_types';

export function respondJson(res: ServerResponse, payload: unknown, statusCode = 200): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export function respondMockFile(res: ServerResponse, data: MockFileResponse): void {
  res.statusCode = data.status ?? 200;
  res.setHeader('Content-Type', data.contentType);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="download.xlsx"; filename*=UTF-8''${encodeURIComponent(data.filename)}`,
  );
  if (data.bodyEncoding === 'base64') {
    res.end(Buffer.from(data.body, 'base64'));
  } else {
    res.end(data.body);
  }
}
