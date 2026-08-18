/**
 * 从 URL 中解析所有 query 参数（包括 hash 内 query）
 * 替代旧的 parseQuery：
 *   - 支持完整 URL 或 query 片段
 *   - 同时解析 search 与 hash 中的 query
 */
export function parseQuery(url: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!url) return result;

  const searchPart = url.split('?')[1]?.split('#')[0] || '';
  if (searchPart) {
    new URLSearchParams(searchPart).forEach((v, k) => {
      result[k] = v;
    });
  }

  const hashQuery = url.split('#')[1]?.split('?')[1] || '';
  if (hashQuery) {
    new URLSearchParams(hashQuery).forEach((v, k) => {
      if (!(k in result)) result[k] = v;
    });
  }

  return result;
}

/**
 * 从 URL 中读取单个参数（兼容 hash 内 query）
 */
export function parseUrlParam(url: string, field: string): string | null {
  if (!url || !field) return null;
  const searchPart = url.split('?')[1]?.split('#')[0] || '';
  const valueFromSearch = new URLSearchParams(searchPart).get(field);
  if (valueFromSearch !== null) return valueFromSearch;

  const hashQuery = url.split('#')[1]?.split('?')[1] || '';
  return new URLSearchParams(hashQuery).get(field);
}

/**
 * 用正则从 URL 中提取参数（不依赖 URL 解析）
 */
export function getQueryString(param: string, url?: string): string {
  const reg = new RegExp(`[?&]?${param}=([^&]+)`);
  const str = url || (typeof location !== 'undefined' ? location.search : '');
  const result = str.match(reg);
  return result ? result[1] : '';
}

export function buildQuery(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.join('&');
}

/**
 * 拼接路径（去除多余斜杠）
 */
export function joinUrl(...parts: string[]): string {
  return parts
    .map((part, i) => {
      if (i === 0) return part.replace(/\/+$/, '');
      return part.replace(/^\/+|\/+$/g, '');
    })
    .filter(Boolean)
    .join('/');
}

/**
 * 将参数对象拼接到 URL（兼容 hash 路由 #/）
 */
export function appendUrlParams(
  baseUrl: string,
  obj: Record<string, string | number | boolean | undefined | null>,
): string {
  if (!baseUrl || !obj || typeof obj !== 'object') return baseUrl;

  if (baseUrl.includes('#/')) {
    const [prefix, hashPart = ''] = baseUrl.split('#/');
    const [hashPath, hashQuery = ''] = hashPart.split('?');
    const hashParams = new URLSearchParams(hashQuery);
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null) {
        hashParams.set(key, String(value));
      }
    }
    const query = hashParams.toString();
    return `${prefix}#/${hashPath}${query ? `?${query}` : ''}`;
  }

  const [pathAndSearch, hash = ''] = baseUrl.split('#');
  const [path, search = ''] = pathAndSearch.split('?');
  const searchParams = new URLSearchParams(search);
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  }
  const query = searchParams.toString();
  const url = `${path}${query ? `?${query}` : ''}`;
  return hash ? `${url}#${hash}` : url;
}

/**
 * 用 URL API 批量设置参数（要求完整 URL）
 */
export function setUrlParams(url: string, params: Record<string, string>[]): string {
  if (!params?.length) return url;
  try {
    const urlObj = new URL(url);
    for (const paramObj of params) {
      for (const [key, value] of Object.entries(paramObj)) {
        if (key && value !== undefined && value !== null) {
          urlObj.searchParams.set(key, value);
        }
      }
    }
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * 当前页 URL 全参数（含 hash 内 query）
 */
export function getPageParams(ignoreList: string[] = []): Record<string, string> {
  const map: Record<string, string> = {};
  if (typeof window === 'undefined') return map;

  if (window.location.search) {
    try {
      const sStr = window.location.search.endsWith('/')
        ? window.location.search.slice(0, -1)
        : window.location.search;
      new URLSearchParams(sStr).forEach((value, attr) => {
        if (!ignoreList.includes(attr)) map[attr] = value;
      });
    } catch {
      // ignore
    }
  }

  if (window.location.hash && window.location.hash.includes('?')) {
    try {
      const sStr = window.location.hash.endsWith('/')
        ? window.location.hash.slice(0, -1)
        : window.location.hash;
      new URLSearchParams(sStr.split('?')[1] || '').forEach((value, attr) => {
        if (!ignoreList.includes(attr)) map[attr] = value;
      });
    } catch {
      // ignore
    }
  }

  return map;
}

/**
 * 安全编码文件名（已编码则不重复编码）
 */
export function safeEncodeName(fileName: string): string {
  if (!fileName) return 'download';
  try {
    const decoded = decodeURIComponent(fileName);
    if (decoded !== fileName) return fileName;
  } catch {
    // ignore
  }
  return encodeURIComponent(fileName);
}

/**
 * 提取域名（hostname）
 */
export function getDomain(url: string): string | null {
  try {
    const { hostname } = new URL(url);
    return hostname;
  } catch {
    return null;
  }
}

/**
 * 提取根域名（启发式，含部分多级 TLD 处理）
 */
export function getRootDomain(url: string): string {
  try {
    if (!url || typeof url !== 'string' || url.trim() === '') return '';

    if (!/^https?:\/\//i.test(url) && !/^\/\/.*/i.test(url)) {
      url = `https://${url}`;
    }

    const hostname = new URL(url).hostname;

    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) return hostname;
    if (/^[0-9a-fA-F:]+$/.test(hostname)) return hostname;

    const parts = hostname.split('.');
    if (parts.length >= 2) {
      const tld = parts.slice(-2).join('.');
      if (/^(com|org|net|co|gov|edu|ac)$/i.test(parts[parts.length - 2])) {
        if (parts.length > 2) {
          return parts.slice(-3).join('.');
        }
      }
      return tld;
    }

    return hostname;
  } catch {
    return '';
  }
}

/**
 * 解析 cookie 字符串中指定键的值（_ga 特殊处理）
 */
export function parseFromCookie(cookieStr: string | undefined, target = ''): string {
  if (!cookieStr || !target) return '';
  const key = target.endsWith('=') ? target.slice(0, -1) : target;
  const cookies = cookieStr.split(';').map((c) => c.trim());
  const tCookie = cookies
    .map((cookie) => {
      const dividerIndex = cookie.indexOf('=');
      if (dividerIndex < 0) {
        return { key: cookie, value: '' };
      }
      return {
        key: cookie.slice(0, dividerIndex),
        value: cookie.slice(dividerIndex + 1),
      };
    })
    .find((cookie) => cookie.key === key);
  if (!tCookie) return '';

  if (key === '_ga') {
    const parts = tCookie.value.split('.');
    if (parts.length >= 2) {
      return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
    }
    return '';
  }
  return tCookie.value;
}
