import { onUnmounted, ref } from 'vue';

export function useInterval(callback: () => void, interval = 1000, immediate = false) {
  const isActive = ref(false);
  let timer: ReturnType<typeof setInterval> | null = null;

  function start() {
    if (isActive.value) return;
    isActive.value = true;
    if (immediate) callback();
    timer = setInterval(callback, interval);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    isActive.value = false;
  }

  onUnmounted(stop);

  return { isActive, start, stop };
}
