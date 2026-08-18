import type { ReportRequestFn } from '../types';

/**
 * 默认 fetch 实现：JSON Body POST，可附 query 参数
 */
export const defaultReportFetch: ReportRequestFn = async <T = unknown>(
  url: string,
  options: {
    method: string;
    params?: Record<string, unknown>;
    body?: unknown;
  },
): Promise<T> => {
  if (typeof fetch === 'undefined') {
    throw new Error(
      'fetch is not available. Please set a custom reportFetch using setReportFetch().',
    );
  }

  const { method, params, body } = options;

  let finalUrl = url;
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    finalUrl = `${url}${url.includes('?') ? '&' : '?'}${searchParams.toString()}`;
  }

  const response = await fetch(finalUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Report request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
};
