import {
  useResponsiveItemGap as _useResponsiveItemGap,
  type UseResponsiveItemGapOptions,
} from '@ku-utils/hooks';
import { useRequestHeaders, useState } from 'nuxt/app';

const MOBILE_UA_RE = /Mobi|Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i;

/**
 * Nuxt 适配版 useResponsiveItemGap (覆盖 @ku-utils/hooks 同名 export 的 auto-import).
 *
 * 修复纯 Vue 版默认 SSR 走 pcGap (因为 width=pcBreakpoint), CSR setup 翻 mobileGap
 * 引发的 hydration mismatch. 与 useDeviceDetect / useResponsiveColumns 共享同一个
 * useState key 'ku-utils:device-is-mobile', 真机 mobile UA SSR 直接走 mobileGap.
 *
 * 局限同 useResponsiveColumns: DevTools Responsive 缩窗模式 UA 是 desktop, SSR 仍按
 * desktop 渲染. 真机 / DevTools 选具体设备时无此问题.
 */
export function useResponsiveItemGap(options: UseResponsiveItemGapOptions = {}) {
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

  return _useResponsiveItemGap({
    ...options,
    ssrIsMobile: options.ssrIsMobile ?? ssrIsMobileShared.value,
  });
}
