import type { Directive } from 'vue';

export const vPermission: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const { value } = binding;
    const permissions = JSON.parse(
      localStorage.getItem('ku_utils_user_permissions') || '[]',
    ) as string[];

    const required = Array.isArray(value) ? value : [value];
    const hasPermission = required.some((p) => permissions.includes(p));

    if (!hasPermission) {
      el.parentNode?.removeChild(el);
    }
  },
};
