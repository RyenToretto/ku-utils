import { onMounted, onUnmounted, ref, type Ref } from 'vue';

export interface VersionLike {
  version: string;
}

export interface UseVersionUpdateOptions<T extends VersionLike = VersionLike> {
  /**
   * 拉取远端版本信息的函数，失败时应返回 null（内部不会抛出）。
   */
  fetchVersion: () => Promise<T | null>;
  /**
   * 从版本对象中提取版本标识符，默认取 v.version。
   */
  getVersionId?: (v: T) => string;
  /**
   * 轮询检测间隔（ms），0 表示不轮询，默认 5 分钟。
   */
  checkInterval?: number;
  /**
   * 页面从后台恢复可见时是否重新检测，默认 true。
   */
  checkOnVisible?: boolean;
  /**
   * visibilitychange / focus 等恢复事件的最短防抖间隔（ms），
   * 合并同一轮切 tab 的连发触发，默认 150。
   */
  resumeCheckDebounce?: number;
  /**
   * 恢复可见触发检测的最短冷却时间（ms），避免频繁切 tab 重复请求，默认 2 秒。
   * 轮询与手动 checkVersion() 不受此限制。
   */
  resumeCheckCooldown?: number;
  /**
   * 组件挂载时立即执行首次检测以建立基线版本，默认 true。
   */
  immediate?: boolean;
  /**
   * 点击刷新时执行的回调；不传则调用 window.location.reload()。
   */
  onRefresh?: () => void;
  /**
   * 从版本对象中提取写入 dataset 的展示文案。
   * 推荐格式：`提交版本:提交时间`（如 `5f3f421:2026-08-06 19:43:02`）。
   * 不传则不写 data-app-version-time / data-latest-app-version-time。
   */
  getVersionTime?: (v: T) => string | undefined;
  /**
   * 是否将版本展示文案同步写入 document.documentElement.dataset，
   * 方便 DevTools、E2E 测试和外部监控工具读取。默认 true。
   *
   * SSR 环境自动跳过（typeof document 守卫），不需要调用方额外判断。
   *
   * 写入规则（不再写入 data-*-app-version）：
   *   无更新（两版本一致）：
   *     data-latest-app-version-time  当前运行版本展示文案（需提供 getVersionTime）
   *   有更新（版本不一致）：
   *     data-latest-app-version-time  新版本展示文案
   *     data-app-version-time         当前运行基线展示文案
   *     data-app-update-available     固定值 "true"
   */
  syncDataset?: boolean;
}

export interface UseVersionUpdateReturn<T extends VersionLike = VersionLike> {
  /** 页面启动时的基线版本信息 */
  currentVersion: Ref<T | null>;
  /** 最近一次远端拉取到的版本信息 */
  latestVersion: Ref<T | null>;
  /** 是否检测到新版本（远端 version !== 基线 version） */
  hasUpdate: Ref<boolean>;
  /** 是否正在拉取版本 */
  checking: Ref<boolean>;
  /** 手动触发一次版本检测 */
  checkVersion: () => Promise<void>;
  /** 刷新页面（执行 onRefresh 回调或 window.location.reload()） */
  refreshForUpdate: () => void;
}

/**
 * 通用静态版本更新检测。
 *
 * 调用方提供 fetchVersion() 拉取远端版本；hook 在 mounted 时建立基线，
 * 此后通过轮询或页面可见性变化检测版本差异，有新版本时暴露 hasUpdate。
 * SSR 安全：所有 document / window 访问均在 onMounted 内或有 typeof 守卫。
 */
export function useVersionUpdate<T extends VersionLike = VersionLike>(
  options: UseVersionUpdateOptions<T>,
): UseVersionUpdateReturn<T> {
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

  const currentVersion = ref<T | null>(null) as Ref<T | null>;
  const latestVersion = ref<T | null>(null) as Ref<T | null>;
  const hasUpdate = ref(false);
  const checking = ref(false);

  /**
   * 将版本状态同步到 <html> dataset，SSR 环境自动跳过。
   * 外部工具可通过 document.documentElement.dataset 读取，无需解析 JS。
   * 只写 *-version-time / update-available；历史 data-*-app-version 会主动清理。
   */
  function flushDataset(): void {
    if (!syncDataset || typeof document === 'undefined') return;
    const el = document.documentElement;

    // 兼容清理旧版写入的 commitId 属性
    delete el.dataset.latestAppVersion;
    delete el.dataset.appVersion;

    // latest-*-time 始终反映最近一次拉取结果
    if (latestVersion.value) {
      const t = getVersionTime?.(latestVersion.value);
      if (t) {
        el.dataset.latestAppVersionTime = t;
      } else {
        delete el.dataset.latestAppVersionTime;
      }
    }

    // 有更新时才额外写入基线展示文案，方便对比「当前运行版本 vs 新版本」
    if (hasUpdate.value && currentVersion.value) {
      const t = getVersionTime?.(currentVersion.value);
      if (t) {
        el.dataset.appVersionTime = t;
      } else {
        delete el.dataset.appVersionTime;
      }
      el.dataset.appUpdateAvailable = 'true';
    } else {
      delete el.dataset.appVersionTime;
      delete el.dataset.appUpdateAvailable;
    }
  }

  async function checkVersion(): Promise<void> {
    if (checking.value) return;
    checking.value = true;
    try {
      const remote = await fetchVersion();
      if (!remote) return;
      latestVersion.value = remote;

      if (!currentVersion.value) {
        // 首次：建立基线，此时不提示更新
        currentVersion.value = remote;
        flushDataset();
        return;
      }

      hasUpdate.value = getVersionId(remote) !== getVersionId(currentVersion.value);
      flushDataset();
    } catch {
      // 静默失败，不影响用户
    } finally {
      checking.value = false;
    }
  }

  function refreshForUpdate(): void {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  }

  let timer: ReturnType<typeof setInterval> | null = null;
  let resumeCheckTimer: ReturnType<typeof setTimeout> | null = null;
  let lastResumeCheckAt = 0;

  /**
   * 合并 visibilitychange + focus 等同轮恢复事件的触发，
   * 并在冷却窗口内跳过重复检测（轮询 / 手动 checkVersion 不受影响）。
   */
  function scheduleResumeCheck(): void {
    if (resumeCheckTimer) {
      clearTimeout(resumeCheckTimer);
    }
    resumeCheckTimer = setTimeout(() => {
      resumeCheckTimer = null;
      const now = Date.now();
      if (now - lastResumeCheckAt < resumeCheckCooldown) return;
      lastResumeCheckAt = now;
      void checkVersion();
    }, resumeCheckDebounce);
  }

  function clearResumeCheckTimer(): void {
    if (resumeCheckTimer) {
      clearTimeout(resumeCheckTimer);
      resumeCheckTimer = null;
    }
  }

  function startPolling(): void {
    if (checkInterval <= 0 || timer) return;
    timer = setInterval(checkVersion, checkInterval);
  }

  function stopPolling(): void {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function handleVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      scheduleResumeCheck();
    }
  }

  // Chrome 在 CDP/远程调试模式下不触发 visibilitychange，
  // window focus 作为补充；与 visibilitychange 共用 scheduleResumeCheck 防抖/冷却。
  function handleWindowFocus(): void {
    scheduleResumeCheck();
  }

  onMounted(() => {
    if (immediate) checkVersion();
    startPolling();
    if (checkOnVisible) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleWindowFocus);
    }
  });

  onUnmounted(() => {
    stopPolling();
    clearResumeCheckTimer();
    if (checkOnVisible) {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    }
  });

  return { currentVersion, latestVersion, hasUpdate, checking, checkVersion, refreshForUpdate };
}
