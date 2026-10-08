import type { MockMethod } from './_types';
import { ok } from './utils';

import { environment } from '@/environments/environment.development';
import { MODULE_PERMISSION_KEYS } from '@/maps/common/dsp-permission';
import exampleMocks from '@/modules/_example/_mock';

const commonMocks: MockMethod[] = [
  {
    url: '/api/user/info',
    method: 'GET',
    response: () =>
      ok({
        id: '10001',
        name: 'demo',
        tenantId: '1',
        tenantName: '演示租户',
        nickName: '演示账号',
        isMaster: true,
        permissionType: 0,
        permissions: [...MODULE_PERMISSION_KEYS],
      }),
  },
];

const mocks: MockMethod[] = [...commonMocks, ...(environment.useExample ? exampleMocks : [])];

export default mocks;
