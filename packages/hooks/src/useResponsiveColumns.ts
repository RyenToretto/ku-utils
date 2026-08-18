import { ref, computed, onMounted, onUnmounted } from 'vue';

const MOBILE_UA_RE = /Mobi|Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i;

export interface ColumnBreakpoints {
  [minWidth: number]: number;
}

export interface UseResponsiveColumnsOptions {
  breakpoints?: ColumnBreakpoints;
  ssrUserAgent?: string;
  ssrMobileCols?: number;
  ssrDesktopCols?: number;
  /**
   * 当确定为「mobile 视口 SSR」(已通过外部判定/共享 useState 拿到 isMobile=true) 时设为 true.
   * 此时 ssrCols 直接走 ssrMobileCols, 不再依赖 ssrUserAgent 的 UA 正则匹配,
   * 让 Nuxt-module wrapper 可复用 useDeviceDetect 的共享 isMobile 信道.
   */
  ssrIsMobile?: boolean;
}

const DEFAULT_BREAKPOINTS: ColumnBreakpoints = {
  0: 2,
  640: 3,
  980: 4,
  1200: 5,
  1460: 6,
};

function getColsForWidth(width: number, breakpoints: ColumnBreakpoints): number {
  const sortedKeys = Object.keys(breakpoints)
    .map(Number)
    .sort((a, b) => b - a);
  for (const bp of sortedKeys) {
    if (width >= bp) return breakpoints[bp];
  }
  return 2;
}

export const useResponsiveColumns = (options: UseResponsiveColumnsOptions = {}) => {
  const {
    breakpoints = DEFAULT_BREAKPOINTS,
    ssrUserAgent,
    ssrMobileCols = 2,
    ssrDesktopCols = 6,
    ssrIsMobile,
  } = options;

  const width = ref(0);
  const ssrCols = (() => {
    if (typeof ssrIsMobile === 'boolean') {
      return ssrIsMobile ? ssrMobileCols : ssrDesktopCols;
    }
    if (ssrUserAgent) {
      return MOBILE_UA_RE.test(ssrUserAgent) ? ssrMobileCols : ssrDesktopCols;
    }
    return ssrDesktopCols;
  })();

  const onResize = () => {
    width.value = window.innerWidth;
  };

  if (typeof window !== 'undefined') {
    width.value = window.innerWidth;
    onMounted(() => {
      width.value = window.innerWidth;
      window.addEventListener('resize', onResize);
    });
    onUnmounted(() => {
      window.removeEventListener('resize', onResize);
    });
  }

  return computed(() => {
    if (!Number.isFinite(width.value) || width.value <= 0) {
      return { min: ssrCols, max: ssrCols };
    }
    const colCount = getColsForWidth(width.value, breakpoints);
    return { min: colCount, max: colCount };
  });
};
