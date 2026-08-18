import type { Directive } from 'vue';

export const vCopy: Directive<HTMLElement, string> = {
  mounted(el, binding) {
    el.style.cursor = 'pointer';
    const handler = async () => {
      try {
        await navigator.clipboard.writeText(binding.value);
        el.setAttribute('data-copied', 'true');
        setTimeout(() => el.removeAttribute('data-copied'), 2000);
      } catch {
        const textarea = document.createElement('textarea');
        textarea.value = binding.value;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    };
    (el as unknown as Record<string, unknown>).__copyHandler = handler;
    el.addEventListener('click', handler);
  },
  updated(el, binding) {
    (el as unknown as Record<string, string>).__copyValue = binding.value;
  },
  unmounted(el) {
    const handler = (el as unknown as Record<string, EventListener>).__copyHandler;
    if (handler) {
      el.removeEventListener('click', handler);
    }
  },
};
