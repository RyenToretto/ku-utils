import { ref, computed, onMounted, onUnmounted } from 'vue';

export interface UseResponsiveItemGapOptions {
  pcGap?: number;
  mobileGap?: number;
  pcBreakpoint?: number;
  designWidth?: number;
  minGap?: number;
  /**
   * 当外部 (Nuxt-module wrapper) 已通过共享 useState 拿到 isMobile 布尔值时, 直接传入.
   * SSR 阶段会以此决定初始 width: ssrIsMobile=true → designWidth (走 mobile gap),
   * ssrIsMobile=false → pcBreakpoint (走 pcGap). 避免"SSR 默认 pc gap, CSR 翻 mobile gap"
   * 的 hydration mismatch 闪烁.
   */
  ssrIsMobile?: boolean;
}

export const useResponsiveItemGap = (options: UseResponsiveItemGapOptions = {}) => {
  const {
    pcGap = 10,
    mobileGap = 20,
    pcBreakpoint = 1024,
    designWidth = 375,
    minGap = 4,
    ssrIsMobile,
  } = options;

  // SSR 初始 width: 客户端用真实 window.innerWidth; 服务端按 ssrIsMobile 决定 (默认 desktop)
  const initialWidth = (() => {
    if (typeof window !== 'undefined') return window.innerWidth;
    if (typeof ssrIsMobile === 'boolean') {
      return ssrIsMobile ? designWidth : pcBreakpoint;
    }
    return pcBreakpoint;
  })();
  const width = ref(initialWidth);

  const onResize = () => {
    width.value = window.innerWidth;
  };

  if (typeof window !== 'undefined') {
    onMounted(() => {
      width.value = window.innerWidth;
      window.addEventListener('resize', onResize);
    });
    onUnmounted(() => {
      window.removeEventListener('resize', onResize);
    });
  }

  return computed(() => {
    if (width.value >= pcBreakpoint) {
      return pcGap;
    }
    const currentWidth = width.value || designWidth;
    const remValue = (currentWidth / designWidth) * 100;
    const doRem = (mobileGap / 100) * remValue;
    const calculatedGap = doRem - 6;
    return Math.max(calculatedGap, minGap);
  });
};
