import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';

export const useScrollGapSync = () => {
  const elGapSync = ref<HTMLElement | null>(null);
  const bodyPaddingRight = ref('0px');

  const updateBodyPaddingRight = () => {
    if (typeof window === 'undefined') return;
    bodyPaddingRight.value = getComputedStyle(document.body).paddingRight;
  };

  watch(bodyPaddingRight, (newPadding) => {
    if (elGapSync.value) {
      elGapSync.value.style.paddingRight = newPadding;
    }
  });

  const observer = ref<MutationObserver | null>(null);

  const startObserver = () => {
    if (typeof window === 'undefined') return;

    observer.value = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          updateBodyPaddingRight();
        }
      });
    });

    observer.value.observe(document.body, {
      attributes: true,
      attributeFilter: ['style'],
    });

    updateBodyPaddingRight();
  };

  const stopObserver = () => {
    if (observer.value) {
      observer.value.disconnect();
      observer.value = null;
    }
  };

  onMounted(() => {
    nextTick().then(startObserver);
  });

  onUnmounted(stopObserver);

  return {
    elGapSync,
    bodyPaddingRight,
    updateBodyPaddingRight,
  };
};
