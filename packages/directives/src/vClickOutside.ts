import type { Directive } from 'vue';

type Handler = (event: MouseEvent) => void;

export const vClickOutside: Directive<HTMLElement, Handler> = {
  mounted(el, binding) {
    const handler = (event: MouseEvent) => {
      if (!el.contains(event.target as Node)) {
        binding.value(event);
      }
    };
    (el as unknown as Record<string, unknown>).__clickOutsideHandler = handler;
    document.addEventListener('click', handler);
  },
  unmounted(el) {
    const handler = (el as unknown as Record<string, Handler>).__clickOutsideHandler;
    if (handler) {
      document.removeEventListener('click', handler);
    }
  },
};
