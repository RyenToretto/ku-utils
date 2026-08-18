import { setCopy } from '@ku-utils/utils';
import { ref } from 'vue';

/**
 * Vue 3 复制 Composable
 * 内部委托给 @ku-utils/utils 的 setCopy，兼容非 HTTPS 与旧浏览器（execCommand 降级）
 */
export function useClipboard() {
  const copied = ref(false);
  const text = ref('');

  async function copy(value: string): Promise<boolean> {
    try {
      await setCopy(value);
      text.value = value;
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, 2000);
      return true;
    } catch {
      return false;
    }
  }

  return { copied, text, copy };
}
