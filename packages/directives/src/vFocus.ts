import type { Directive } from 'vue';

/**
 * v-focus
 * Focuses the element (or its first input/textarea) after mount.
 *
 * Works with native inputs as well as component wrappers (e.g. el-input):
 *   <input v-focus />
 *   <el-input v-focus />
 */
export const vFocus: Directive<HTMLElement> = {
  mounted(el) {
    const target =
      el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
        ? el
        : el.querySelector<HTMLElement>('input, textarea');
    target?.focus();
  },
};
