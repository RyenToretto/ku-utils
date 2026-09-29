import type { UserConfig } from 'vite';

export function createBuildConfig(): UserConfig['build'] {
  return {
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('/element-ui/') || id.includes('/@element-ui/')) return 'element-ui';
          if (
            id.includes('/node_modules/vue/') ||
            id.includes('/vue-router/') ||
            id.includes('/pinia/') ||
            id.includes('/axios/')
          )
            return 'vendor';
          if (id.includes('/echarts/') || id.includes('/zrender/')) return 'echarts';
        },
      },
    },
  };
}
