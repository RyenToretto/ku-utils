import { resolve } from 'path';

import vue2 from '@vitejs/plugin-vue2';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue2()],
  build: {
    target: 'es2015',
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'KuUtilsV2CustomColumns',
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue', 'element-ui', 'vuedraggable'],
      output: {
        globals: {
          vue: 'Vue',
          'element-ui': 'ELEMENT',
          vuedraggable: 'vuedraggable',
        },
        assetFileNames: 'style.css',
        exports: 'named',
      },
    },
  },
});
