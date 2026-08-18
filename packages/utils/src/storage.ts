interface StorageItem<T> {
  value: T;
  expire?: number;
}

const isClient = typeof window !== 'undefined';

const isDevEnv = (): boolean => {
  // 仅在浏览器开发环境打 warn；Node SSR 静默
  if (!isClient) return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Boolean((globalThis as any).__DEV__ ?? (import.meta as any)?.env?.DEV);
  } catch {
    return false;
  }
};

const warnDev = (scope: string, op: string, key: string, err: unknown): void => {
  if (!isDevEnv()) return;
  try {
    console.warn(`[${scope}] ${op} failed for key "${key}"`, err);
  } catch {
    /* ignore */
  }
};

function createStorage(storage: Storage, scope: 'local' | 'session') {
  return {
    /**
     * 写入带 expire 元信息的 JSON 包装值
     *
     * 兼容性变更（2026-05）：返回值从 `void` 改为 `boolean`，方便业务判断写入是否成功（隐私模式 / 配额超出 / SecurityError 等场景 false）。
     */
    set<T>(key: string, value: T, expireMs?: number): boolean {
      try {
        const item: StorageItem<T> = { value };
        if (expireMs) item.expire = Date.now() + expireMs;
        storage.setItem(key, JSON.stringify(item));
        return true;
      } catch (err) {
        // Safari 私密模式 SecurityError / QuotaExceededError / 序列化失败
        warnDev(scope, 'set', key, err);
        return false;
      }
    },

    get<T>(key: string, defaultValue?: T): T | undefined {
      let raw: string | null;
      try {
        raw = storage.getItem(key);
      } catch (err) {
        // 私密模式 getItem 也可能抛 SecurityError
        warnDev(scope, 'get', key, err);
        return defaultValue;
      }
      if (!raw) return defaultValue;
      try {
        const item: StorageItem<T> = JSON.parse(raw);
        if (item.expire && Date.now() > item.expire) {
          try {
            storage.removeItem(key);
          } catch {
            /* ignore: 与 remove 同样兜底 */
          }
          return defaultValue;
        }
        return item.value;
      } catch {
        return defaultValue;
      }
    },

    remove(key: string): boolean {
      try {
        storage.removeItem(key);
        return true;
      } catch (err) {
        warnDev(scope, 'remove', key, err);
        return false;
      }
    },

    clear(): boolean {
      try {
        storage.clear();
        return true;
      } catch (err) {
        warnDev(scope, 'clear', '*', err);
        return false;
      }
    },

    /**
     * 直接以字符串形式写入，不做 JSON 包装，不附带 expire。
     *
     * 适用场景：业务层只想存一个枚举字符串（如 'pay_wait' / 'pay_success'）作为跨页信道，
     * 同时希望「其它代码裸 `localStorage.getItem(KEY)` 也能拿到原值」时使用，
     * 避免被 set() 的 JSON 包装意外加上引号。
     */
    setRaw(key: string, value: string): boolean {
      try {
        storage.setItem(key, value);
        return true;
      } catch (err) {
        warnDev(scope, 'setRaw', key, err);
        return false;
      }
    },

    /** 直接读字符串，不解 JSON */
    getRaw(key: string): string | null {
      try {
        return storage.getItem(key);
      } catch (err) {
        warnDev(scope, 'getRaw', key, err);
        return null;
      }
    },
  };
}

const noopStorage = (): Storage =>
  ({
    setItem() {},
    getItem: () => null,
    removeItem() {},
    clear() {},
    length: 0,
    key: () => null,
  }) as Storage;

export const local = isClient
  ? createStorage(window.localStorage, 'local')
  : createStorage(noopStorage(), 'local');

export const session = isClient
  ? createStorage(window.sessionStorage, 'session')
  : createStorage(noopStorage(), 'session');
