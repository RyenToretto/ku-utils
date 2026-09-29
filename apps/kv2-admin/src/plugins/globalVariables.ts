import * as utils from '@ku-utils/utils';
import type { PluginObject } from 'vue';

import maps from '@/maps';

export type KuUtilsFns = typeof utils;

const globalVariables: PluginObject<undefined> = {
  install(Vue) {
    Vue.prototype.$utils = utils;
    Vue.prototype.$MAPS = maps;
    Vue.prototype.$UI_HEADER_HEIGHT = 56;
  },
};

export default globalVariables;
