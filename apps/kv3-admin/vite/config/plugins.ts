import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import ElementPlusStyle from 'unplugin-element-plus/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import type { PluginOption } from 'vite';

import { dspMockPlugin } from '../plugins/dsp-mock';

export async function createPlugins(useMock: boolean): Promise<PluginOption[]> {
  return [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
      dts: 'src/types/auto-imports.d.ts',
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/types/components.d.ts',
    }),
    ElementPlusStyle({}),
    dspMockPlugin(useMock),
  ];
}
