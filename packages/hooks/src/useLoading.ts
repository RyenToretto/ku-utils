import { ref } from 'vue';

export function useLoading(initialValue = false) {
  const loading = ref(initialValue);

  async function wrap<T>(fn: () => Promise<T>): Promise<T> {
    loading.value = true;
    try {
      return await fn();
    } finally {
      loading.value = false;
    }
  }

  function start() {
    loading.value = true;
  }

  function stop() {
    loading.value = false;
  }

  return { loading, wrap, start, stop };
}
