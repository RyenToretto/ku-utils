import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
  HttpResponse,
  type HttpInterceptorFn,
  type HttpRequest,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import qs from 'qs';
import { catchError, map, throwError } from 'rxjs';

import { ApiError, type ApiEnvelope } from '@/api/envelope';
import {
  isUnauthorizedBusinessCode,
  isUserInfoMissingLocalUserCode,
  isUserNotProvisionedBusinessCode,
  peekLogoutNext,
  redirectToLogin,
  UNAUTHORIZED_BUSINESS_CODE,
  USER_NOT_PROVISIONED_BUSINESS_CODE,
} from '@/utils/auth-redirect';
import { isAuthStatusPath } from '@/utils/auth-status';
import { doEnv } from '@/utils/env';

const LEGACY_VIRTUAL_USER_ID_STORAGE_KEY = 'kv3-admin.virtual-user-id';
const LEGACY_VIRTUAL_USER_NAME_STORAGE_KEY = 'kv3-admin.virtual-user-name';

export function clearLegacyVirtualUserWorkspace() {
  localStorage.removeItem(LEGACY_VIRTUAL_USER_ID_STORAGE_KEY);
  localStorage.removeItem(LEGACY_VIRTUAL_USER_NAME_STORAGE_KEY);
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiRequestOptions = {
  params?: Record<string, unknown>;
  signal?: AbortSignal;
};

function apiPrefix(): string {
  return doEnv.apiBaseUrl.replace(/\/+$/, '');
}

function isApiRequest(req: HttpRequest<unknown>): boolean {
  return req.url.startsWith(`${apiPrefix()}/`);
}

/** 空串 / null / undefined 及空数组 query 不上送（对齐 kr axios filterEmptyProperty） */
function filterEmptyProperty(raw: unknown, isQueryParams: boolean): unknown {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value === '' || value === undefined || value === null) continue;
    if (isQueryParams && Array.isArray(value) && value.length === 0) continue;
    cleaned[key] = value;
  }
  return cleaned;
}

function isUserInfoRequest(url: string): boolean {
  return /(^|\/)user\/info(\?|$)/.test(url);
}

function isHtmlLikePayload(payload: unknown, contentType: string): boolean {
  if (contentType.includes('text/html')) return true;
  if (typeof payload !== 'string') return false;
  const head = payload.slice(0, 256).trimStart().toLowerCase();
  return head.startsWith('<!doctype') || head.startsWith('<html');
}

function toNumericCode(code: unknown): number | string | undefined {
  if (code == null || code === '') return undefined;
  return typeof code === 'string' ? Number(code) : (code as number);
}

function shouldSkipUnauthorizedRedirect(): boolean {
  if (peekLogoutNext() != null) return true;
  return isAuthStatusPath(window.location.pathname);
}

function buildUserNotProvisioned(body: unknown): ApiError {
  const code =
    body && typeof body === 'object' && 'code' in body
      ? (body as { code?: number | string }).code
      : undefined;
  const err = new ApiError('user-not-provisioned', {
    code: code != null && code !== '' ? code : USER_NOT_PROVISIONED_BUSINESS_CODE,
    payload: body,
  });
  if (
    body &&
    typeof body === 'object' &&
    typeof (body as { message?: unknown }).message === 'string'
  ) {
    err.serverMessage = (body as { message: string }).message;
  }
  return err;
}

/**
 * 统一信封拦截（对齐 kr `plugins/axios.ts` 响应拦截）：
 * code=0 放行；1402/1406（user/info）→ 未开通；1401 / HTTP 401 → 未登录；其余 code 提示后 reject。
 */
export const apiEnvelopeInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isApiRequest(req)) return next(req);
  const message = inject(NzMessageService);

  const rejectUnauthorized = (status?: number, payload?: unknown): ApiError => {
    const err = new ApiError('unauthorized', { code: UNAUTHORIZED_BUSINESS_CODE, status, payload });
    // Mock 模式无真实 OIDC：禁止整页跳 /login（同源 SPA 会 bootstrap 死循环）
    if (doEnv.useMock || shouldSkipUnauthorizedRedirect()) return err;
    message.error('未登录');
    redirectToLogin();
    return err;
  };

  return next(req).pipe(
    map((event) => {
      if (!(event instanceof HttpResponse)) return event;
      const payload = event.body;
      const contentType = event.headers.get('content-type') || '';

      if (isHtmlLikePayload(payload, contentType)) {
        const msg = '接口响应异常，请刷新重试';
        message.error(msg);
        throw new ApiError(msg, { status: event.status });
      }

      if (payload && typeof payload === 'object' && 'code' in payload) {
        const code = (payload as ApiEnvelope).code;
        const numericCode = toNumericCode(code);
        if (
          isUserNotProvisionedBusinessCode(numericCode) ||
          (isUserInfoRequest(req.url) && isUserInfoMissingLocalUserCode(numericCode))
        ) {
          throw buildUserNotProvisioned(payload);
        }
        if (isUnauthorizedBusinessCode(numericCode)) {
          throw rejectUnauthorized(event.status, payload);
        }
        if (code === 0 || code === '0') return event;
        const msg = (payload as ApiEnvelope).message || '请求失败';
        message.error(msg);
        throw new ApiError(msg, { code, status: event.status, payload });
      }

      const msg = '接口响应格式异常';
      message.error(msg);
      throw new ApiError(msg, { status: event.status, payload });
    }),
    catchError((error: unknown) => {
      if (error instanceof ApiError) return throwError(() => error);
      if (!(error instanceof HttpErrorResponse)) return throwError(() => error);

      const httpStatus = error.status;
      const body = error.error as unknown;

      // 2xx 但 JSON 解析失败（多为网关回了 index.html）
      if (httpStatus >= 200 && httpStatus < 300) {
        const msg = '接口响应异常，请刷新重试';
        message.error(msg);
        return throwError(() => new ApiError(msg, { status: httpStatus }));
      }

      const bodyCode =
        body && typeof body === 'object' && 'code' in body
          ? (body as { code: number | string }).code
          : undefined;
      const numericCode = toNumericCode(bodyCode);

      if (
        isUserNotProvisionedBusinessCode(numericCode) ||
        (isUserInfoRequest(req.url) && isUserInfoMissingLocalUserCode(numericCode))
      ) {
        return throwError(() => buildUserNotProvisioned(body ?? error));
      }

      if (httpStatus === 401 || isUnauthorizedBusinessCode(numericCode)) {
        return throwError(() => rejectUnauthorized(httpStatus, body));
      }

      const bodyMessage =
        body && typeof body === 'object' ? (body as { message?: string }).message : undefined;
      const msg = bodyMessage || error.message || '网络异常';
      message.error(msg);
      return throwError(
        () => new ApiError(msg, { code: bodyCode, status: httpStatus, payload: body }),
      );
    }),
  );
};

/**
 * 业务 API 客户端：Promise 风格（对齐 kv3/kr axios 调用面），支持 `AbortSignal` 取消。
 * GET query 数组统一由 qs `arrayFormat: 'comma'` 序列化为英文逗号分隔字符串。
 */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);

  get<T>(url: string, options: ApiRequestOptions = {}) {
    return this.request<T>('GET', url, undefined, options);
  }

  delete<T>(url: string, options: ApiRequestOptions = {}) {
    return this.request<T>('DELETE', url, undefined, options);
  }

  post<T>(url: string, body?: unknown, options: ApiRequestOptions = {}) {
    return this.request<T>('POST', url, body, options);
  }

  put<T>(url: string, body?: unknown, options: ApiRequestOptions = {}) {
    return this.request<T>('PUT', url, body, options);
  }

  patch<T>(url: string, body?: unknown, options: ApiRequestOptions = {}) {
    return this.request<T>('PATCH', url, body, options);
  }

  private request<T>(
    method: HttpMethod,
    url: string,
    body: unknown,
    { params, signal }: ApiRequestOptions,
  ): Promise<ApiEnvelope<T>> {
    const query = filterEmptyProperty(params, true) as Record<string, unknown> | undefined;
    const httpParams = query
      ? new HttpParams({ fromString: qs.stringify(query, { arrayFormat: 'comma' }) })
      : undefined;
    const payload = ['POST', 'PUT', 'PATCH'].includes(method)
      ? filterEmptyProperty(body, false)
      : undefined;

    return new Promise<ApiEnvelope<T>>((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }
      const subscription = this.http
        .request<ApiEnvelope<T>>(method, `${apiPrefix()}${url}`, {
          body: payload,
          params: httpParams,
          withCredentials: true,
        })
        .subscribe({ next: resolve, error: reject });
      signal?.addEventListener(
        'abort',
        () => {
          subscription.unsubscribe();
          reject(new DOMException('Aborted', 'AbortError'));
        },
        { once: true },
      );
    });
  }
}
