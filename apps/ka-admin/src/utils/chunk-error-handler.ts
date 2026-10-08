import { NavigationError, type Router } from '@angular/router';

import { doEnv } from '@/utils/env';

interface RouterTarget {
  fullPath?: string;
}

export interface ChunkErrorHandlerEnvironment {
  baseUrl: string;
  now: () => number;
  storage: Pick<Storage, 'getItem' | 'setItem'>;
  assign: (url: string) => void;
  reload: () => void;
  schedule: (callback: () => void) => unknown;
  addUnhandledRejectionListener: (handler: (event: PromiseRejectionEvent) => void) => void;
  removeUnhandledRejectionListener: (handler: (event: PromiseRejectionEvent) => void) => void;
}

const CHUNK_RELOAD_KEY = '__chunk_reload_ts__';
const RELOAD_COOLDOWN_MS = 10_000;

export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Unable to preload CSS') ||
    message.includes('error loading dynamically imported module') ||
    message.includes('Importing a module script failed')
  );
}

function createBrowserEnvironment(): ChunkErrorHandlerEnvironment {
  return {
    baseUrl: doEnv.baseUrl,
    now: () => Date.now(),
    storage: {
      getItem: (key) => window.sessionStorage.getItem(key),
      setItem: (key, value) => window.sessionStorage.setItem(key, value),
    },
    assign: (url) => window.location.assign(url),
    reload: () => window.location.reload(),
    schedule: (callback) => window.setTimeout(callback, 0),
    addUnhandledRejectionListener: (handler) =>
      window.addEventListener('unhandledrejection', handler),
    removeUnhandledRejectionListener: (handler) =>
      window.removeEventListener('unhandledrejection', handler),
  };
}

function canReload(environment: ChunkErrorHandlerEnvironment): boolean {
  try {
    const storedReloadAt = environment.storage.getItem(CHUNK_RELOAD_KEY);
    const now = environment.now();
    if (storedReloadAt !== null) {
      const lastReloadAt = Number(storedReloadAt);
      if (!Number.isFinite(lastReloadAt) || now - lastReloadAt < RELOAD_COOLDOWN_MS) return false;
    }
    environment.storage.setItem(CHUNK_RELOAD_KEY, String(now));
    return true;
  } catch {
    return false;
  }
}

function resolveTarget(
  baseUrl: string,
  to: RouterTarget | string | null | undefined,
): string | null {
  const fullPath = typeof to === 'string' ? to : to?.fullPath;
  if (!fullPath) return null;

  const base = baseUrl.replace(/\/+$/, '');
  const target = fullPath.startsWith('/') ? fullPath : `/${fullPath}`;
  return `${base}${target}`;
}

/**
 * 部署后旧 chunk 失效时刷新应用，并保留用户原本要进入的路由。
 * 返回清理函数，供微前端卸载或重复挂载场景移除监听。
 */
export function setupChunkErrorHandler(
  router: Router,
  environment: ChunkErrorHandlerEnvironment = createBrowserEnvironment(),
): () => void {
  let routerHandled = false;

  const subscription = router.events.subscribe((event) => {
    if (!(event instanceof NavigationError)) return;
    if (!isChunkLoadError(event.error) || !canReload(environment)) return;
    const to: RouterTarget = { fullPath: event.url };

    routerHandled = true;
    environment.schedule(() => {
      routerHandled = false;
    });

    const target = resolveTarget(environment.baseUrl, to);
    if (target) environment.assign(target);
    else environment.reload();
  });

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    if (!isChunkLoadError(event.reason)) return;
    if (routerHandled) {
      routerHandled = false;
      return;
    }
    if (!canReload(environment)) return;

    event.preventDefault();
    environment.reload();
  };

  environment.addUnhandledRejectionListener(handleUnhandledRejection);

  return () => {
    subscription.unsubscribe();
    environment.removeUnhandledRejectionListener(handleUnhandledRejection);
  };
}
