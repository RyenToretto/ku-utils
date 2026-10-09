import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import ElementPlusStyle from 'unplugin-element-plus/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import type { PluginOption } from 'vite';

import { dspMockPlugin } from '../plugins/dsp-mock';

/** `writeDts`：仅 Demo 开启时扫描到全量组件；关 Demo 的构建若写入会把已提交的 d.ts 裁残 */
export async function createPlugins(useMock: boolean, writeDts: boolean): Promise<PluginOption[]> {
  return [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
      dts: writeDts ? 'src/types/auto-imports.d.ts' : false,
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: writeDts ? 'src/types/components.d.ts' : false,
    }),
    ElementPlusStyle({}),
    dspMockPlugin(useMock),
  ];
}
