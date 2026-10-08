/** 巨效 DSP 统一响应信封：code === 0 表示成功 */
export interface ApiEnvelope<T = unknown> {
  code: number | string;
  message?: string;
  data: T;
}

export interface PageData<T> {
  lists: T[];
  total: number;
}

/** 业务错误：HTTP 2xx 但信封 code≠0，或网络 / HTTP 异常（对齐 kr axios reject 形状） */
export class ApiError extends Error {
  readonly code?: number | string;
  readonly status?: number;
  readonly payload?: unknown;
  serverMessage?: string;

  constructor(
    message: string,
    init: { code?: number | string; status?: number; payload?: unknown } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = init.code;
    this.status = init.status;
    this.payload = init.payload;
  }
}
