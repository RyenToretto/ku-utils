import authRoute from './common/auth-route';
import deleteState from './common/delete-state';
import * as dspPermission from './common/dsp-permission';

import exampleMaps from '@/modules/_example/_maps';

const maps = {
  authRoute,
  deleteState,
  dspPermission,
  example: exampleMaps,
};

export default maps;
export type AdminMaps = typeof maps;
