import type { Directive } from 'vue';

interface DebounceBinding {
  handler: (...args: unknown[]) => void;
  delay?: number;
  event?: string;
}

export const vDebounce: Directive<HTMLElement, DebounceBinding> = {
  mounted(el, binding) {
    const { handler, delay = 300, event = 'click' } = binding.value;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const debouncedHandler = (...args: unknown[]) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => handler(...args), delay);
    };

    (el as unknown as Record<string, unknown>).__debounceHandler = debouncedHandler;
    (el as unknown as Record<string, string>).__debounceEvent = event;
    el.addEventListener(event, debouncedHandler);
  },
  unmounted(el) {
    const handler = (el as unknown as Record<string, EventListener>).__debounceHandler;
    const event = (el as unknown as Record<string, string>).__debounceEvent;
    if (handler && event) {
      el.removeEventListener(event, handler);
    }
  },
};
