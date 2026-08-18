import { onUnmounted, ref } from 'vue';

export interface UseMediaQueryOptions {
  /**
   * SSR 阶段 matches 的初始值 (默认 false).
   *
   * 默认情况下 SSR 端 matchMedia 不可用, matches 永远为 false, 导致 SSR HTML 按 false
   * 渲染, CSR setup 立即翻成真实 matches 值, 引发 hydration mismatch.
   *
   * Nuxt-module wrapper 会根据 query 内容 + 服务端 UA 智能推断 (例如 max-width: 768px
   * + mobile UA → ssrFallback=true), 调用方一般无需手动传.
   */
  ssrFallback?: boolean;
}

export function useMediaQuery(query: string, options: UseMediaQueryOptions = {}) {
  const matches = ref(options.ssrFallback ?? false);

  if (typeof window !== 'undefined') {
    const mql = window.matchMedia(query);
    matches.value = mql.matches;

    const handler = (e: MediaQueryListEvent) => {
      matches.value = e.matches;
    };
    mql.addEventListener('change', handler);
    onUnmounted(() => mql.removeEventListener('change', handler));
  }

  return matches;
}

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export interface UseBreakpointOptions {
  /**
   * SSR 阶段假设当前是否为 mobile 设备.
   * - true: sm/md/lg/xl/xxl 全部初始 false (mobile, 全部 min-width 不达标)
   * - false (默认): sm/md/lg/xl/xxl 全部初始 true (desktop, 假设大屏)
   * Nuxt-module wrapper 会根据 useRequestHeaders('user-agent') 自动决定.
   */
  ssrIsMobile?: boolean;
}

export function useBreakpoint(options: UseBreakpointOptions = {}) {
  const { ssrIsMobile } = options;
  // ssrIsMobile=true → 所有 min-width: Npx 都不命中 (mobile 不到 sm)
  // ssrIsMobile=false 或 undefined → 默认按 desktop 大屏处理 (全部命中)
  const ssrFallback = typeof ssrIsMobile === 'boolean' ? !ssrIsMobile : true;

  const sm = useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`, { ssrFallback });
  const md = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`, { ssrFallback });
  const lg = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`, { ssrFallback });
  const xl = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`, { ssrFallback });
  const xxl = useMediaQuery(`(min-width: ${BREAKPOINTS['2xl']}px)`, { ssrFallback });

  return { sm, md, lg, xl, xxl };
}
