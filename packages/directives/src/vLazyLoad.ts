import type { Directive } from 'vue';

export const vLazyLoad: Directive<HTMLImageElement, string> = {
  mounted(el, binding) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.src = binding.value;
          observer.unobserve(el);
        }
      },
      { rootMargin: '100px' },
    );
    observer.observe(el);
    (el as unknown as Record<string, IntersectionObserver>).__lazyObserver = observer;
  },
  unmounted(el) {
    const observer = (el as unknown as Record<string, IntersectionObserver>).__lazyObserver;
    if (observer) {
      observer.disconnect();
    }
  },
};
