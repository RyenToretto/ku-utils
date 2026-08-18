import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';

type NullableTimer = ReturnType<typeof setTimeout> | null;

function createDebounce(fn: () => void, delay: number) {
  let timer: NullableTimer = null;
  const debounced = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  return debounced;
}

export function useScrollbarStatus() {
  const isScrolling = ref(false);
  const visibleScroller = ref(false);
  const refScroller = ref<HTMLElement | undefined>();
  const observerBody = ref<MutationObserver | null>(null);
  const isInitialized = ref(false);

  const checkScrollbar = createDebounce(() => {
    if (!refScroller.value) return;
    try {
      isScrolling.value = refScroller.value.scrollHeight > refScroller.value.clientHeight;
    } catch (error) {
      console.warn('Error checking scrollbar:', error);
    }
  }, 16);

  const initializeScrollerObserver = () => {
    if (isInitialized.value || !refScroller.value) return;

    try {
      checkScrollbar();
      window.addEventListener('resize', checkScrollbar);
      observerBody.value = new MutationObserver(() => {
        nextTick().then(checkScrollbar);
      });
      observerBody.value.observe(refScroller.value, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
      });
      isInitialized.value = true;
    } catch (error) {
      console.warn('Error initializing scroller observers:', error);
    }
  };

  const cleanupScrollerObserver = () => {
    window.removeEventListener('resize', checkScrollbar);
    if (observerBody.value) {
      observerBody.value.disconnect();
      observerBody.value = null;
    }
    isInitialized.value = false;
  };

  watch(refScroller, (newVal, oldVal) => {
    if (oldVal && isInitialized.value) cleanupScrollerObserver();
    if (newVal) nextTick().then(initializeScrollerObserver);
  });

  onMounted(() => {
    if (refScroller.value) initializeScrollerObserver();
  });

  onBeforeUnmount(cleanupScrollerObserver);

  return {
    refScroller,
    isScrolling,
    visibleScroller,
    checkScrollbar,
  };
}

export function useParentScrollbarStatus() {
  const isScrolling = ref(false);
  const visibleScroller = ref(false);
  const elParent = ref<HTMLElement | undefined>();
  const refScroller = ref<HTMLElement | undefined>();
  const parentResizeObserver = ref<ResizeObserver | null>(null);
  const isInitialized = ref(false);

  const checkScrollbar = createDebounce(() => {
    if (!refScroller.value) return;
    try {
      isScrolling.value = refScroller.value.scrollHeight > refScroller.value.clientHeight;
    } catch (error) {
      console.warn('Error checking scrollbar:', error);
    }
  }, 16);

  const checkScrollerExistence = () => {
    if (!elParent.value) return;
    if (refScroller.value && elParent.value.contains(refScroller.value)) {
      checkScrollbar();
    }
  };

  const initializeParentObserver = () => {
    if (isInitialized.value || !elParent.value) return;
    try {
      parentResizeObserver.value = new ResizeObserver(() => {
        nextTick().then(checkScrollerExistence);
      });
      parentResizeObserver.value.observe(elParent.value);
      nextTick().then(checkScrollerExistence);
      isInitialized.value = true;
    } catch (error) {
      console.warn('Error initializing parent ResizeObserver:', error);
    }
  };

  const cleanupParentObserver = () => {
    if (parentResizeObserver.value) {
      parentResizeObserver.value.disconnect();
      parentResizeObserver.value = null;
    }
    isInitialized.value = false;
  };

  watch(elParent, (newVal, oldVal) => {
    if (oldVal && isInitialized.value) cleanupParentObserver();
    if (newVal) nextTick().then(initializeParentObserver);
  });

  watch(refScroller, () => {
    if (isInitialized.value) nextTick().then(checkScrollerExistence);
  });

  onMounted(() => {
    if (elParent.value) initializeParentObserver();
  });

  onBeforeUnmount(cleanupParentObserver);

  return {
    elParent,
    refScroller,
    isScrolling,
    visibleScroller,
    checkScrollbar,
  };
}
