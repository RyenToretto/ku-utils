import { DestroyRef, inject, type Signal, signal } from '@angular/core';

export interface VersionLike {
  version: string;
}

export interface InjectVersionUpdateOptions<T extends VersionLike = VersionLike> {
  /** 拉取远端版本信息的函数，失败时应返回 null（内部不会抛出） */
  fetchVersion: () => Promise<T | null>;
  /** 从版本对象中提取版本标识符，默认取 v.version */
  getVersionId?: (v: T) => string;
  /** 轮询检测间隔（ms），0 表示不轮询，默认 5 分钟 */
  checkInterval?: number;
  /** 页面从后台恢复可见时是否重新检测，默认 true */
  checkOnVisible?: boolean;
  /** visibilitychange / focus 恢复事件的合并防抖（ms），默认 150 */
  resumeCheckDebounce?: number;
  /** 恢复可见触发检测的最短冷却（ms），默认 2 秒；轮询与手动 checkVersion() 不受限 */
  resumeCheckCooldown?: number;
  /** 注入时立即执行首次检测以建立基线版本，默认 true */
  immediate?: boolean;
  /** 点击刷新时执行的回调；不传则调用 window.location.reload() */
  onRefresh?: () => void;
  /** 写入 dataset 的展示文案，推荐 `提交版本:提交时间`；不传则不写 *-version-time */
  getVersionTime?: (v: T) => string | undefined;
  /**
   * 是否把版本展示文案写入 document.documentElement.dataset，默认 true。
   *   无更新：data-latest-app-version-time
   *   有更新：data-latest-app-version-time + data-app-version-time + data-app-update-available="true"
   */
  syncDataset?: boolean;
}

export interface InjectVersionUpdateReturn<T extends VersionLike = VersionLike> {
  /** 页面启动时的基线版本信息 */
  currentVersion: Signal<T | null>;
  /** 最近一次远端拉取到的版本信息 */
  latestVersion: Signal<T | null>;
  /** 是否检测到新版本 */
  hasUpdate: Signal<boolean>;
  /** 是否正在拉取版本 */
  checking: Signal<boolean>;
  /** 手动触发一次版本检测 */
  checkVersion: () => Promise<void>;
  /** 刷新页面（执行 onRefresh 回调或 window.location.reload()） */
  refreshForUpdate: () => void;
}

/**
 * 通用静态版本更新检测（须在注入上下文调用）。
 *
 * 注入时建立基线，此后通过轮询或页面恢复可见检测版本差异；DestroyRef 销毁时清理定时器与监听。
 * SSR 安全：所有 document / window 访问都有 typeof 守卫。
 */
export function injectVersionUpdate<T extends VersionLike = VersionLike>(
  options: InjectVersionUpdateOptions<T>,
): InjectVersionUpdateReturn<T> {
  const {
    fetchVersion,
    getVersionId = (v: T) => v.version,
    getVersionTime,
    checkInterval = 5 * 60 * 1000,
    checkOnVisible = true,
    resumeCheckDebounce = 150,
    resumeCheckCooldown = 2_000,
    immediate = true,
    onRefresh,
    syncDataset = true,
  } = options;

  const destroyRef = inject(DestroyRef);
  const currentVersion = signal<T | null>(null);
  const latestVersion = signal<T | null>(null);
  const hasUpdate = signal(false);
  const checking = signal(false);

  function flushDataset(): void {
    if (!syncDataset || typeof document === 'undefined') return;
    const el = document.documentElement;

    const latest = latestVersion();
    if (latest) {
      const t = getVersionTime?.(latest);
      if (t) el.dataset['latestAppVersionTime'] = t;
      else delete el.dataset['latestAppVersionTime'];
    }

    const current = currentVersion();
    if (hasUpdate() && current) {
      const t = getVersionTime?.(current);
      if (t) el.dataset['appVersionTime'] = t;
      else delete el.dataset['appVersionTime'];
      el.dataset['appUpdateAvailable'] = 'true';
    } else {
      delete el.dataset['appVersionTime'];
      delete el.dataset['appUpdateAvailable'];
    }
  }

  async function checkVersion(): Promise<void> {
    if (checking()) return;
    checking.set(true);
    try {
      const remote = await fetchVersion();
      if (!remote) return;
      latestVersion.set(remote);

      const current = currentVersion();
      if (!current) {
        // 首次：建立基线，此时不提示更新
        currentVersion.set(remote);
        flushDataset();
        return;
      }

      hasUpdate.set(getVersionId(remote) !== getVersionId(current));
      flushDataset();
    } catch {
      // 静默失败，不影响用户
    } finally {
      checking.set(false);
    }
  }

  function refreshForUpdate(): void {
    if (onRefresh) onRefresh();
    else window.location.reload();
  }

  if (typeof window !== 'undefined') {
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;
    let lastResumeCheckAt = 0;

    const scheduleResumeCheck = (): void => {
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        resumeTimer = null;
        const now = Date.now();
        if (now - lastResumeCheckAt < resumeCheckCooldown) return;
        lastResumeCheckAt = now;
        void checkVersion();
      }, resumeCheckDebounce);
    };

    const onVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') scheduleResumeCheck();
    };

    if (immediate) void checkVersion();
    if (checkInterval > 0) {
      pollTimer = setInterval(() => void checkVersion(), checkInterval);
    }
    // Chrome 在 CDP/远程调试模式下不触发 visibilitychange，用 window focus 补充；两者共用防抖/冷却
    if (checkOnVisible) {
      document.addEventListener('visibilitychange', onVisibilityChange);
      window.addEventListener('focus', scheduleResumeCheck);
    }

    destroyRef.onDestroy(() => {
      if (pollTimer) clearInterval(pollTimer);
      if (resumeTimer) clearTimeout(resumeTimer);
      if (checkOnVisible) {
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('focus', scheduleResumeCheck);
      }
    });
  }

  return {
    currentVersion: currentVersion.asReadonly(),
    latestVersion: latestVersion.asReadonly(),
    hasUpdate: hasUpdate.asReadonly(),
    checking: checking.asReadonly(),
    checkVersion,
    refreshForUpdate,
  };
}
