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
          if (id.includes('/antd/') || id.includes('/@ant-design/')) return 'antd';
          if (
            id.includes('/node_modules/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router') ||
            id.includes('/zustand/') ||
            id.includes('/axios/')
          )
            return 'vendor';
        },
      },
    },
  };
}
