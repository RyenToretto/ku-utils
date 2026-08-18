import { ref, onMounted, onUnmounted } from 'vue';

export function usePopover() {
  const visible = ref(false);
  const triggerRef = ref<HTMLElement | null>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (triggerRef.value && !triggerRef.value.contains(event.target as Node)) {
      visible.value = false;
    }
  };

  onMounted(() => {
    document.addEventListener('click', handleClickOutside, true);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside, true);
  });

  return { visible, triggerRef };
}
