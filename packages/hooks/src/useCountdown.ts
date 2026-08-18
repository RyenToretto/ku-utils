import { type Ref, getCurrentInstance, onUnmounted, ref } from 'vue';

interface UseCountdownReturn {
  count: Ref<number>;
  isActive: Ref<boolean>;
  start: (seconds?: number) => void;
  stop: () => void;
  reset: () => void;
}

export function useCountdown(initialSeconds = 60): UseCountdownReturn {
  const count = ref(0);
  const isActive = ref(false);
  let timer: ReturnType<typeof setInterval> | null = null;

  function clear() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function start(seconds = initialSeconds) {
    clear();
    count.value = seconds;
    isActive.value = true;
    timer = setInterval(() => {
      count.value--;
      if (count.value <= 0) {
        stop();
      }
    }, 1000);
  }

  function stop() {
    clear();
    isActive.value = false;
  }

  function reset() {
    stop();
    count.value = 0;
  }

  if (getCurrentInstance()) {
    onUnmounted(() => clear());
  }

  return { count, isActive, start, stop, reset };
}
