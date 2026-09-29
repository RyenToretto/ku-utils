import exampleMaps from '@example-maps';

import authRoute from './common/authRoute';
import deleteState from './common/deleteState';
import * as dspPermission from './common/dspPermission';

import type RealExampleMaps from '@/modules/_example/_maps';

/** Demo 开时为真实 maps；关时 alias 指向 stub，运行时 {}，类型仍按真实 maps */
const example = exampleMaps as typeof RealExampleMaps;

const maps = {
  authRoute,
  deleteState,
  dspPermission,
  example,
};

export default maps;
export type AdminMaps = typeof maps;
