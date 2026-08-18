import { ref, computed, watch, onMounted } from 'vue';

export const useDomState = (
  pendingGetter: (...args: any[]) => boolean,
  init?: (...args: any[]) => any,
) => {
  const isDomReady = ref(false);
  const isServiceReady = computed(() => {
    if (pendingGetter) {
      return !pendingGetter() && isDomReady.value;
    }
    return isDomReady.value;
  });

  if (init) watch(isServiceReady, init);

  onMounted(() => {
    isDomReady.value = true;
  });

  return {
    isDomReady,
    isServiceReady,
  };
};
