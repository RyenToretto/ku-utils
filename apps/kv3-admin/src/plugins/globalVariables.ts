import * as utils from '@ku-utils/utils';
import type { App, Plugin } from 'vue';

import maps from '@/maps';

/** 与 globalProperties.$utils 对齐，供 ComponentCustomProperties 声明 */
export type KuUtilsFns = typeof utils;

const globalVariables: Plugin = {
  install(app: App) {
    app.config.globalProperties.$utils = utils;
    app.config.globalProperties.$MAPS = maps;
    app.config.globalProperties.$UI_HEADER_HEIGHT = 56;
  },
};

export default globalVariables;
