import { useBreakpoint as _useBreakpoint, type UseBreakpointOptions } from '@ku-utils/hooks';
import { useRequestHeaders, useState } from 'nuxt/app';

const MOBILE_UA_RE = /Mobi|Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i;

/**
 * Nuxt 适配版 useBreakpoint (覆盖 @ku-utils/hooks 同名 export 的 auto-import).
 *
 * 纯 Vue 版 useBreakpoint 内部调用 useMediaQuery, SSR 阶段 matches 永远默认 false,
 * 导致 sm/md/lg/xl/xxl 在 SSR 时全是 false (=mobile), CSR setup 翻成真实 matchMedia,
 * 引发 hydration mismatch.
 *
 * 本 wrapper 接 useDeviceDetect 的共享 useState 'ku-utils:device-is-mobile':
 *  - mobile UA: ssrIsMobile=true → 所有 breakpoint 初始 false (mobile, 全部不命中)
 *  - desktop UA: ssrIsMobile=false → 所有 breakpoint 初始 true (desktop, 全部命中)
 *
 * 这样 SSR HTML 与目标设备类型对齐, 真机用户首屏无 breakpoint 闪烁.
 */
export function useBreakpoint(options: UseBreakpointOptions = {}) {
  const ssrIsMobileShared = useState<boolean>('ku-utils:device-is-mobile', () => {
    if (import.meta.server) {
      try {
        const ua = useRequestHeaders(['user-agent'])['user-agent'] || '';
        return MOBILE_UA_RE.test(ua);
      } catch {
        return false;
      }
    }
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  return _useBreakpoint({
    ...options,
    ssrIsMobile: options.ssrIsMobile ?? ssrIsMobileShared.value,
  });
}
