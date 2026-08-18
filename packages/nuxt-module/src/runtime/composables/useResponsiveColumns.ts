import {
  useResponsiveColumns as _useResponsiveColumns,
  type UseResponsiveColumnsOptions,
} from '@ku-utils/hooks';
import { useRequestHeaders, useState } from 'nuxt/app';

const MOBILE_UA_RE = /Mobi|Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i;

/**
 * Nuxt 适配版 useResponsiveColumns (覆盖 @ku-utils/hooks 同名 export 的 auto-import).
 *
 * 在 Nuxt 4 SSR + SPA 场景下, 纯 Vue 版的 useResponsiveColumns 默认 SSR 阶段无法知道
 * 客户端 UA → 永远按 desktop 列数 (默认 6) 渲染骨架, 移动端真机首屏会先看到 6 列骨架,
 * 等 hydration 完成才被 patch 成 2 列, 造成"6 列闪一下变 2 列"的视觉错乱.
 *
 * 本 wrapper 接入 Nuxt 三件套修复:
 *
 *  1. 「SSR UA 自动检测」: 服务端用 useRequestHeaders('user-agent') 取 UA,
 *     调用方不需要手动传 ssrUserAgent
 *  2. 「与 useDeviceDetect 共享 isMobile 信道」: 用同一个 useState key
 *     ('ku-utils:device-is-mobile') 持久化首次检测结果,
 *     避免两个 hook 重复 UA 检测且结果不一致
 *  3. 「ssrIsMobile 直传」: 把共享 useState 的布尔值直接传给底层 hook,
 *     绕过 UA 正则二次匹配
 *
 * 局限: 仍依赖 UA / Client Hint, 浏览器 DevTools 「Responsive」缩窗模式默认 UA 是 desktop,
 * 此场景无法在 SSR 阶段识别为 mobile, 仍会有闪烁. 真机 / DevTools 选具体设备时无此问题.
 *
 * API 与 @ku-utils/hooks 的 useResponsiveColumns 完全一致, 通过 @ku-utils/nuxt-module 自动 auto-import.
 */
export function useResponsiveColumns(options: UseResponsiveColumnsOptions = {}) {
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
      // 客户端 SPA 导航首次落到本 hook 时的兜底 (一般 useState 已在 SSR/CSR hydration 时填好)
      return window.innerWidth < 1024;
    }
    return false;
  });

  return _useResponsiveColumns({
    ...options,
    ssrIsMobile: options.ssrIsMobile ?? ssrIsMobileShared.value,
  });
}
