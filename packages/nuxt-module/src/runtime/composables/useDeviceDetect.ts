import type { UseDeviceDetectOptions } from '@ku-utils/hooks';
import { useNuxtApp, useRequestHeaders, useState } from 'nuxt/app';
import { computed, onMounted, onUnmounted, ref } from 'vue';

const MOBILE_UA_RE = /Mobi|Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i;

/**
 * Nuxt 适配版 useDeviceDetect (覆盖 @ku-utils/hooks 同名 export 的 auto-import).
 *
 * 在 Nuxt 4 SSR + SPA 导航并存的场景下, 纯 Vue 版的 useDeviceDetect 会在 SPA 导航过去的
 * 新组件首帧返回错误的 isMobile (ssrIsMobile=false 兜底, 等 onMounted 才翻转).
 * 这会让 mobile 用户先看到 desktop 布局再切 mobile, 严重时 desktop 组件挂载副作用 (API
 * 请求 / store 写入 / DOM 操作) 已经发生, 切换后状态错乱.
 *
 * 本 wrapper 接入 Nuxt 三件套修复:
 *
 *  1. 「SSR UA 自动检测」: 服务端通过 useRequestHeaders('user-agent') 取 UA,
 *     调用方不需要手动传 ssrUserAgent
 *  2. 「跨实例/跨路由共享」: useState('ku-utils:device-is-mobile') 把首次检测结果挂到 Nuxt payload,
 *     SPA 导航过去的新组件直接复用初值, 不会"恢复成 false"
 *  3. 「forceImmediate 自适配」: useNuxtApp().isHydrating=false 时 (即 SPA 导航 / 弹窗动态挂载),
 *     setup 首帧就直接走 windowWidth < breakpoint, 不再走 hydrated 门控
 *
 * API 与 @ku-utils/hooks 的 useDeviceDetect 完全一致, 通过 @ku-utils/nuxt-module 自动 auto-import.
 */
export function useDeviceDetect(options: UseDeviceDetectOptions = {}) {
  const { mobileBreakpoint = 1024 } = options;

  // SSR/CSR 共享的 ssrIsMobile: 服务端用 UA 决定, 客户端首次创建用 windowWidth 兜底,
  // 后续 SPA 导航全部复用 (Nuxt useState 跨组件共享 + 跨路由持久化)
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
      return window.innerWidth < mobileBreakpoint;
    }
    return false;
  });

  // 仅当显式传入 ssrUserAgent 时, 用它覆盖共享值 (历史调用方留的逃生通道)
  const ssrIsMobile = options.ssrUserAgent
    ? ref(MOBILE_UA_RE.test(options.ssrUserAgent))
    : ssrIsMobileShared;

  const hydrated = ref(false);
  const windowWidth = ref(0);

  const isMobile = computed(() => {
    if (!hydrated.value) return ssrIsMobile.value;
    return windowWidth.value < mobileBreakpoint;
  });

  if (typeof window !== 'undefined') {
    windowWidth.value = window.innerWidth;

    // SPA 导航 / 弹窗动态挂载等纯 CSR 场景下, 立即把 hydrated 设为 true 跳过门控,
    // 避免"先 desktop 一帧再 mobile"的视觉错乱.
    // SSR hydration 阶段保持 hydrated=false 走 ssrIsMobile, 防止 hydration mismatch.
    let forceImmediate = options.forceImmediate;
    if (forceImmediate === undefined) {
      try {
        forceImmediate = !useNuxtApp().isHydrating;
      } catch {
        forceImmediate = false;
      }
    }
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
