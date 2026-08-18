import type { Directive } from 'vue';

export const vLongpress: Directive<HTMLElement, () => void> = {
  mounted(el, binding) {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const start = () => {
      timer = setTimeout(() => binding.value(), 500);
    };
    const cancel = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    el.addEventListener('mousedown', start);
    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('mouseup', cancel);
    el.addEventListener('mouseleave', cancel);
    el.addEventListener('touchend', cancel);
    el.addEventListener('touchcancel', cancel);

    (el as unknown as Record<string, unknown>).__longpressStart = start;
    (el as unknown as Record<string, unknown>).__longpressCancel = cancel;
  },
  unmounted(el) {
    const start = (el as unknown as Record<string, EventListener>).__longpressStart;
    const cancel = (el as unknown as Record<string, EventListener>).__longpressCancel;
    if (start && cancel) {
      el.removeEventListener('mousedown', start);
      el.removeEventListener('touchstart', start);
      el.removeEventListener('mouseup', cancel);
      el.removeEventListener('mouseleave', cancel);
      el.removeEventListener('touchend', cancel);
      el.removeEventListener('touchcancel', cancel);
    }
  },
};
