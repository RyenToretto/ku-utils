import { type Ref, ref, shallowRef } from 'vue';

interface UseRequestOptions<T> {
  immediate?: boolean;
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseRequestReturn<T> {
  data: Ref<T | undefined>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  execute: (...args: unknown[]) => Promise<T | undefined>;
  refresh: () => Promise<T | undefined>;
}

export function useRequest<T>(
  fn: (...args: unknown[]) => Promise<T>,
  options: UseRequestOptions<T> = {},
): UseRequestReturn<T> {
  const { immediate = false, initialData, onSuccess, onError } = options;

  const data = shallowRef<T | undefined>(initialData) as Ref<T | undefined>;
  const loading = ref(false);
  const error = ref<Error | null>(null);
  let lastArgs: unknown[] = [];

  async function execute(...args: unknown[]): Promise<T | undefined> {
    lastArgs = args;
    loading.value = true;
    error.value = null;
    try {
      const result = await fn(...args);
      data.value = result;
      onSuccess?.(result);
      return result;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      error.value = err;
      onError?.(err);
      return undefined;
    } finally {
      loading.value = false;
    }
  }

  async function refresh(): Promise<T | undefined> {
    return execute(...lastArgs);
  }

  if (immediate) {
    execute();
  }

  return { data, loading, error, execute, refresh };
}
