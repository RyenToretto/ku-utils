import { tryWakeApp } from './tryWakeApp';

declare global {
  interface Window {
    __du_download_tid?: ReturnType<typeof setTimeout> | null;
  }
}

/**
 * 尝试通过 scheme 唤起 App，返回 Promise 表示是否需要 fallback 下载
 *   - resolve(true)：scheme 无响应，需 fallback
 *   - resolve(false)：已被唤起或被取消（页面已切走 / 重复调用）
 *
 * 与 appAndDownload 的区别：本函数返回 Promise，由调用方决定 fallback 行为。
 * callback 参数仅作为「需要 fallback」的存在性条件保留（兼容旧 API）。
 */
export function startDownload(schemeLink: string, callback?: () => void): Promise<boolean> {
  return tryWakeApp(schemeLink, {
    store: {
      get: () => window.__du_download_tid,
      set: (t) => {
        window.__du_download_tid = t;
      },
    },
  }).then((needFallback) => needFallback && typeof callback === 'function');
}
