import { addComponent, addImports, addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit';
import type { NuxtModule } from '@nuxt/schema';

export interface ModuleOptions {
  components?: boolean;
  composables?: boolean;
  directives?: boolean;
  css?: boolean;
}

const kuUtilsModule: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@ku-utils/nuxt-module',
    configKey: 'kuUtils',
  },
  defaults: {
    components: true,
    composables: true,
    directives: true,
    css: true,
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);

    // 保证消费方 SSR 时 @ku-utils/hooks 走 transpile，避免裸 ESM 在 server bundle 翻车
    nuxt.options.build = nuxt.options.build || ({} as typeof nuxt.options.build);
    nuxt.options.build.transpile = nuxt.options.build.transpile || [];
    if (!nuxt.options.build.transpile.includes('@ku-utils/hooks')) {
      nuxt.options.build.transpile.push('@ku-utils/hooks');
    }

    if (options.css) {
      nuxt.options.css.push('@ku-utils/design-tokens/css');
      nuxt.options.css.push('@ku-utils/ui/style');
    }

    if (options.components) {
      const components = [
        'DuButton',
        'DuCard',
        'DuEmpty',
        'DuLiquidFloatingBar',
        'DuLiquidGlass',
        'DuModal',
        'DuStatusTag',
      ];
      components.forEach((name) => {
        addComponent({
          name,
          export: name,
          filePath: '@ku-utils/ui',
        });
      });
    }

    if (options.composables) {
      const composables = [
        // 原有
        'useLoading',
        'useRequest',
        'usePagination',
        'useClipboard',
        'useCountdown',
        'useEventBus',
        'useMediaQuery',
        'useFullscreen',
        'useInterval',
        'useWebSocket',
        // 自 du-composables 平移
        'createEventBus',
        'useIntersection',
        'useDialogState',
        'usePopover',
        'useDomState',
        'useScrollbarStatus',
        'useParentScrollbarStatus',
        'useScrollGapSync',
        // 版本更新检测（SSR 安全：所有 document/window 访问均在 onMounted 内）
        'useVersionUpdate',
      ];
      composables.forEach((name) => {
        addImports({ name, from: '@ku-utils/hooks' });
      });

      // 视口/设备相关的 composable 必须走 Nuxt-aware wrapper, 否则 SSR 阶段无法识别移动设备
      // 会出现 "先 desktop 渲染再 patch 成 mobile" 的视觉错乱. 这批 wrapper 共享同一个
      // useState key 'ku-utils:device-is-mobile', SSR 阶段从 useRequestHeaders 取 UA
      // 一次性决定, 跨 hook / 跨组件 / 跨 SPA 路由复用. 详见各 wrapper 顶部注释.
      //   - useDeviceDetect: SPA 导航 / 弹窗动态挂载场景闪烁
      //   - useResponsiveColumns: 瀑布流首屏 SSR 列数错乱 ("6 列闪一下变 2 列")
      //   - useResponsiveItemGap: SSR pcGap → CSR mobileGap 间距闪烁
      //   - useBreakpoint: SSR sm/md/lg/xl/xxl 全 false → CSR matchMedia 真值闪烁
      const nuxtAwareComposables = [
        'useDeviceDetect',
        'useResponsiveColumns',
        'useResponsiveItemGap',
        'useBreakpoint',
      ];
      nuxtAwareComposables.forEach((name) => {
        addImports({
          name,
          from: resolve(`./runtime/composables/${name}`),
        });
      });
    }

    if (options.directives) {
      addPlugin({
        src: resolve('./runtime/plugin'),
        mode: 'client',
      });
    }
  },
});

export default kuUtilsModule;
