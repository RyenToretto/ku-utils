import exampleMocks from '@example-mocks';

import type { MockMethod } from './_types';
import { ok } from './utils';

import { MODULE_PERMISSION_KEYS } from '@/maps/common/dspPermission';

const useExample = import.meta.env.VITE_APP_USE_EXAMPLE === '1';

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

const mocks: MockMethod[] = [...commonMocks, ...(useExample ? exampleMocks : [])];

export default mocks;
