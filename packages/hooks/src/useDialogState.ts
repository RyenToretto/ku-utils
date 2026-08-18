import { ref } from 'vue';

export const useDialogState = (initialVisible = false) => {
  const visible = ref(initialVisible);

  const show = () => {
    visible.value = true;
  };
  const hide = () => {
    visible.value = false;
  };
  const toggle = () => {
    visible.value = !visible.value;
  };

  return {
    visible,
    show,
    hide,
    toggle,
  };
};
