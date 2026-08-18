import { ref, watch, type Ref } from 'vue';

export type StorageType = 'localStorage' | 'sessionStorage';

export interface UseStorageOptions<T> {
  storage?: StorageType;
  serializer?: {
    read: (raw: string) => T;
    write: (value: T) => string;
  };
}

const defaultSerializer = {
  read: <T>(raw: string): T => JSON.parse(raw),
  write: <T>(value: T): string => JSON.stringify(value),
};

/**
 * 响应式的 Storage 封装，数据变更时自动同步到 localStorage / sessionStorage
 */
export function useStorage<T>(
  key: string,
  defaultValue: T,
  options: UseStorageOptions<T> = {},
): Ref<T> {
  const { storage: storageType = 'localStorage', serializer = defaultSerializer } = options;

  const getStorage = (): Storage | null => {
    if (typeof window === 'undefined') return null;
    return storageType === 'localStorage' ? window.localStorage : window.sessionStorage;
  };

  const readValue = (): T => {
    const storage = getStorage();
    if (!storage) return defaultValue;
    try {
      const raw = storage.getItem(key);
      return raw !== null ? serializer.read(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const data = ref<T>(readValue()) as Ref<T>;

  watch(
    data,
    (newValue) => {
      const storage = getStorage();
      if (!storage) return;
      try {
        if (newValue === null || newValue === undefined) {
          storage.removeItem(key);
        } else {
          storage.setItem(key, serializer.write(newValue));
        }
      } catch {
        console.warn(`[useStorage] 写入 ${storageType} 失败，key: ${key}`);
      }
    },
    { deep: true },
  );

  return data;
}
