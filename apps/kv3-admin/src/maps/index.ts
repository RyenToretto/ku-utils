import example from '@example-maps';

import authRoute from './common/authRoute';
import deleteState from './common/deleteState';
import * as dspPermission from './common/dspPermission';

const maps = {
  authRoute,
  deleteState,
  dspPermission,
  example,
};

export default maps;
export type AdminMaps = typeof maps;
