import { message } from 'antd';
import axios from 'axios';
import qs from 'qs';

import {
  isUnauthorizedBusinessCode,
  isUserInfoMissingLocalUserCode,
  isUserNotProvisionedBusinessCode,
  peekLogoutNext,
  redirectToLogin,
  submitLogout,
  USER_NOT_PROVISIONED_BUSINESS_CODE,
} from '@/utils/authRedirect';
import { isAuthStatusPath } from '@/utils/authStatus';
import { doEnv } from '@/utils/env';

export type AxiosInstanceType = ReturnType<typeof axios.create>;

const LEGACY_VIRTUAL_USER_ID_STORAGE_KEY = 'kv3-admin.virtual-user-id';
const LEGACY_VIRTUAL_USER_NAME_STORAGE_KEY = 'kv3-admin.virtual-user-name';

function clearLegacyVirtualUserWorkspace() {
  localStorage.removeItem(LEGACY_VIRTUAL_USER_ID_STORAGE_KEY);
  localStorage.removeItem(LEGACY_VIRTUAL_USER_NAME_STORAGE_KEY);
}

/**
 * GET query 数组统一由 qs `arrayFormat: 'comma'` 序列化为英文逗号分隔字符串。
 */
const service = axios.create({
  baseURL: doEnv.VITE_APP_API_BASE_URL || '/api',
  withCredentials: true,
  paramsSerializer(params) {
    return qs.stringify(params, { arrayFormat: 'comma' });
  },
});

function filterEmptyProperty(config: { method?: string; data?: unknown; params?: unknown }) {
  const method = (config.method || 'get').toLowerCase();
  const dataKey = ['post', 'put', 'patch'].includes(method) ? 'data' : 'params';
  const raw = config[dataKey as 'data' | 'params'];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return;

  const isQueryParams = dataKey === 'params';
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value === '' || value === undefined || value === null) continue;
    if (isQueryParams && Array.isArray(value) && value.length === 0) continue;
    cleaned[key] = value;
  }
  (config as Record<string, unknown>)[dataKey] = cleaned;
}

function isUserInfoRequest(config?: { url?: string; baseURL?: string } | null): boolean {
  const url = String(config?.url || '');
  return /(^|\/)user\/info(\?|$)/.test(url);
}

function extractEnvelopeCode(payload: unknown): number | string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  if ('code' in payload) return (payload as { code?: number | string }).code;
  const data = (payload as { response?: { data?: unknown } }).response?.data;
  if (data && typeof data === 'object' && 'code' in data) {
    return (data as { code?: number | string }).code;
  }
  return undefined;
}

function shouldSkipUnauthorizedRedirect(): boolean {
  if (peekLogoutNext() != null) return true;
  return isAuthStatusPath(window.location.pathname);
}

function rejectUnauthorized(payload?: unknown): Promise<never> {
  if (shouldSkipUnauthorizedRedirect()) {
    const err = new Error('unauthorized') as Error & { cause?: unknown };
    err.cause = payload;
    return Promise.reject(err);
  }
  message.error('未登录');
  redirectToLogin();
  return Promise.reject(payload ?? new Error('unauthorized'));
}

function rejectUserNotProvisioned(payload?: unknown): Promise<never> {
  const err = new Error('user-not-provisioned') as Error & {
    code?: number | string;
    serverMessage?: string;
  };
  const code = extractEnvelopeCode(payload);
  err.code = code != null && code !== '' ? code : USER_NOT_PROVISIONED_BUSINESS_CODE;
  if (payload && typeof payload === 'object') {
    const body =
      'message' in payload
        ? payload
        : (payload as { response?: { data?: { message?: string } } }).response?.data;
    if (
      body &&
      typeof body === 'object' &&
      typeof (body as { message?: string }).message === 'string'
    ) {
      err.serverMessage = (body as { message: string }).message;
    }
  }
  return Promise.reject(err);
}

service.interceptors.request.use((config) => {
  filterEmptyProperty(config);
  return config;
});

function isHtmlLikePayload(payload: unknown, contentType: string): boolean {
  if (contentType.includes('text/html')) return true;
  if (typeof payload !== 'string') return false;
  const head = payload.slice(0, 256).trimStart().toLowerCase();
  return head.startsWith('<!doctype') || head.startsWith('<html');
}

service.interceptors.response.use(
  (response) => {
    const payload = response.data;
    const contentType = String(response.headers?.['content-type'] || '');

    if (isHtmlLikePayload(payload, contentType)) {
      const msg = '接口响应异常，请刷新重试';
      message.error(msg);
      return Promise.reject(new Error(msg));
    }

    if (payload && typeof payload === 'object' && 'code' in payload) {
      const code = (payload as { code: number | string }).code;
      const numericCode = typeof code === 'string' ? Number(code) : code;
      if (
        isUserNotProvisionedBusinessCode(numericCode) ||
        (isUserInfoRequest(response.config) && isUserInfoMissingLocalUserCode(numericCode))
      ) {
        return rejectUserNotProvisioned(payload);
      }
      if (isUnauthorizedBusinessCode(numericCode)) {
        return rejectUnauthorized(payload);
      }
      if (code === 0 || code === '0') {
        return payload;
      }
      const msg = (payload as { message?: string }).message || '请求失败';
      message.error(msg);
      return Promise.reject(payload);
    }

    const msg = '接口响应格式异常';
    message.error(msg);
    return Promise.reject(new Error(msg));
  },
  (error) => {
    const httpStatus = error?.response?.status as number | undefined;
    const body = error?.response?.data;
    const bodyCode =
      body && typeof body === 'object' && 'code' in body
        ? (body as { code: number | string }).code
        : undefined;
    const numericCode = typeof bodyCode === 'string' ? Number(bodyCode) : bodyCode;
    const fromUserInfo = isUserInfoRequest(error?.config);

    if (
      isUserNotProvisionedBusinessCode(numericCode) ||
      (fromUserInfo && isUserInfoMissingLocalUserCode(numericCode))
    ) {
      return rejectUserNotProvisioned(body ?? error);
    }

    if (httpStatus === 401 || isUnauthorizedBusinessCode(numericCode)) {
      return rejectUnauthorized(error);
    }

    const msg =
      (body && typeof body === 'object' && (body as { message?: string }).message) ||
      error?.message ||
      '网络异常';
    message.error(msg);
    return Promise.reject(error);
  },
);

clearLegacyVirtualUserWorkspace();
window.axios = service;

export { service as axios, redirectToLogin, submitLogout };
export default service;
