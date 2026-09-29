import react from '@vitejs/plugin-react';
import type { PluginOption } from 'vite';

import { dspMockPlugin } from '../plugins/dsp-mock';

export async function createPlugins(useMock: boolean): Promise<PluginOption[]> {
  return [react(), dspMockPlugin(useMock)];
}
