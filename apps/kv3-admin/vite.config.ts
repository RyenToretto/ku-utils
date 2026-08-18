import { fileURLToPath, URL } from 'node:url';

import { defineConfig, loadEnv, type UserConfig } from 'vite';

import { createBuildConfig } from './vite/config/build';
import { createPlugins } from './vite/config/plugins';
import { createServerConfig } from './vite/config/server';
import { forbidExampleInBundle } from './vite/plugins/forbid-example-in-bundle';

export default defineConfig(async ({ mode, command }): Promise<UserConfig> => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_APP_API_PROXY || 'http://localhost:8181';
  const useMock = env.VITE_USE_MOCK === 'true';
  const useExample = env.VITE_APP_USE_EXAMPLE === '1';
  const port = Number(env.VITE_APP_PORT || 5173);

  const exampleRoutes = useExample
    ? fileURLToPath(new URL('./src/modules/_example/_router/index.ts', import.meta.url))
    : fileURLToPath(new URL('./src/stubs/emptyExampleRoutes.ts', import.meta.url));
  const exampleMaps = useExample
    ? fileURLToPath(new URL('./src/modules/_example/_maps/index.ts', import.meta.url))
    : fileURLToPath(new URL('./src/stubs/emptyExampleMaps.ts', import.meta.url));
  const exampleMocks = useExample
    ? fileURLToPath(new URL('./src/modules/_example/_mock/index.ts', import.meta.url))
    : fileURLToPath(new URL('./src/stubs/emptyExampleMocks.ts', import.meta.url));

  const exampleTab = useExample
    ? fileURLToPath(new URL('./src/layouts/headerExampleTabEntry.ts', import.meta.url))
    : fileURLToPath(new URL('./src/stubs/emptyExampleNavTab.ts', import.meta.url));

  return {
    base: env.VITE_APP_PUBLIC_PATH || '/',
    plugins: [...(await createPlugins(useMock)), forbidExampleInBundle(useExample)],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "${fileURLToPath(new URL('./src/assets/styles/common/index.scss', import.meta.url))}" as *;`,
        },
      },
    },
    resolve: {
      dedupe: ['vue', 'vue-router', 'pinia'],
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@example-routes': exampleRoutes,
        '@example-maps': exampleMaps,
        '@example-mocks': exampleMocks,
        '@header-example-tab': exampleTab,
      },
    },
    server: createServerConfig(useMock, proxyTarget, port, command === 'serve'),
    build: createBuildConfig(),
  };
});
