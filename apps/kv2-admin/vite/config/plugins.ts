import vue2 from '@vitejs/plugin-vue2';
import type { PluginOption } from 'vite';

import { dspMockPlugin } from '../plugins/dsp-mock';

export async function createPlugins(useMock: boolean): Promise<PluginOption[]> {
  return [vue2(), dspMockPlugin(useMock)];
}
