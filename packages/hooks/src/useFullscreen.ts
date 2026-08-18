import { getCurrentScope, onScopeDispose, ref } from 'vue';

export function useFullscreen(target?: HTMLElement) {
  const isFullscreen = ref(false);

  async function enter() {
    const el = target || document.documentElement;
    try {
      await el.requestFullscreen();
      isFullscreen.value = true;
    } catch {}
  }

  async function exit() {
    try {
      await document.exitFullscreen();
      isFullscreen.value = false;
    } catch {}
  }

  function toggle() {
    return isFullscreen.value ? exit() : enter();
  }

  function onFullscreenChange() {
    isFullscreen.value = !!document.fullscreenElement;
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('fullscreenchange', onFullscreenChange);

    if (getCurrentScope()) {
      onScopeDispose(() => {
        document.removeEventListener('fullscreenchange', onFullscreenChange);
      });
    }
  }

  return { isFullscreen, enter, exit, toggle };
}
