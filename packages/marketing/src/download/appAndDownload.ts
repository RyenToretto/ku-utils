import { tryWakeApp } from './tryWakeApp';

let loadingTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 尝试通过 scheme 唤起 App，超时未唤起则跳转下载地址
 *
 * 行为：
 *   - 若上次调用的定时器尚未结束，本次调用直接返回（防抖）
 *   - 通过 visibilitychange / pagehide 检测到页面被遮蔽，认为 App 已唤起，取消下载
 */
export function appAndDownload(schemeLink: string, downloadUrl?: string): void {
  if (loadingTimer) return;

  void tryWakeApp(schemeLink, {
    store: {
      get: () => loadingTimer,
      set: (t) => {
        loadingTimer = t;
      },
    },
  }).then((needFallback) => {
    if (needFallback && downloadUrl) {
      window.location.href = downloadUrl;
    }
  });
}
