/**
 * Mock 方法类型 — 供 mock 模块与 Vite 内联 mock 插件共用。
 */
export interface MockContext {
  body: Record<string, unknown>;
  query: Record<string, string>;
  params: Record<string, string>;
}

export interface MockMethod {
  url: string;
  method?:
    'get' | 'post' | 'put' | 'delete' | 'patch' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  response: (ctx: MockContext) => unknown;
}

export type MockErrorKind = 'validation' | 'not-found' | 'conflict' | 'unsupported' | 'forbidden';

export const MOCK_USER_MESSAGE: Record<MockErrorKind, string> = {
  validation: '请求参数有误，请检查后重试',
  'not-found': '未找到对应数据，请确认后重试',
  conflict: '请求冲突，请刷新后重试',
  unsupported: '当前操作暂不支持',
  forbidden: '提交内容有误，请检查后重试',
};

export class MockRequestError extends Error {
  readonly isMockRequestError = true;
  readonly kind: MockErrorKind;
  readonly detail: string;

  constructor(kind: MockErrorKind, detail: string) {
    super(detail);
    this.name = 'MockRequestError';
    this.kind = kind;
    this.detail = detail;
  }
}

export function mockUserMessage(error: MockRequestError): string {
  return MOCK_USER_MESSAGE[error.kind];
}

export type MockExecutionResult =
  { ok: true; data: unknown } | { ok: false; error: MockRequestError };

export function executeMockHandler(handler: MockMethod, context: MockContext): MockExecutionResult {
  try {
    return { ok: true, data: handler.response(context) };
  } catch (error: unknown) {
    if (
      error instanceof MockRequestError ||
      (error instanceof Error &&
        (error as Error & { isMockRequestError?: unknown }).isMockRequestError === true)
    ) {
      return { ok: false, error: error as MockRequestError };
    }
    throw error;
  }
}

export interface MockFileResponse {
  type: 'file';
  status?: number;
  filename: string;
  contentType: string;
  body: string;
  bodyEncoding?: 'utf8' | 'base64';
}
