import { ref, computed, onMounted, onUnmounted } from 'vue';

const MOBILE_UA_RE = /Mobi|Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i;

export interface UseDeviceDetectOptions {
  mobileBreakpoint?: number;
  ssrUserAgent?: string;
  /**
   * 当确定当前组件为「纯客户端 SPA 挂载」(无 SSR HTML 需要 hydration 对齐) 时设为 true.
   *
   * 原因: 默认情况下 isMobile 在 setup 阶段会先返回 ssrIsMobile (避免 SSR/CSR hydration mismatch),
   * 等 onMounted 触发后才翻转到 windowWidth < breakpoint. 这套门控对 SSR-then-hydrate 场景是必要的,
   * 但对纯 CSR 路径 (SPA 导航 / 弹窗动态挂载 / 无 SSR HTML) 来说是有害的 — 它会让组件先按
   * desktop 渲染一帧, 然后才翻转到 mobile, 造成移动端"先挂错布局再切换"的视觉错乱.
   *
   * 设为 true 后, setup 阶段就把 hydrated=true 并立即填入 window.innerWidth,
   * 让 isMobile 直接走 windowWidth < breakpoint, 首帧就拿到正确的设备结果.
   *
   * Nuxt 上下文调用时, 推荐由 @ku-utils/nuxt-module 的 wrapper 传入 !useNuxtApp().isHydrating.
   */
  forceImmediate?: boolean;
}

export function useDeviceDetect(options: UseDeviceDetectOptions = {}) {
  const { mobileBreakpoint = 1024, ssrUserAgent, forceImmediate = false } = options;

  const ssrIsMobile = ref(ssrUserAgent ? MOBILE_UA_RE.test(ssrUserAgent) : false);

  const hydrated = ref(false);
  const windowWidth = ref(0);

  const isMobile = computed(() => {
    if (!hydrated.value) return ssrIsMobile.value;
    return windowWidth.value < mobileBreakpoint;
  });

  if (typeof window !== 'undefined') {
    windowWidth.value = window.innerWidth;

    if (forceImmediate) {
      hydrated.value = true;
    }

    const onResize = () => {
      windowWidth.value = window.innerWidth;
    };

    onMounted(() => {
      hydrated.value = true;
      windowWidth.value = window.innerWidth;
      window.addEventListener('resize', onResize);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', onResize);
    });
  }

  return { isMobile, windowWidth };
}
