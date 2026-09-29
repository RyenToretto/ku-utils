import { EXAMPLE_MODULE } from '@/maps/common/dspPermission';
import clazzManage from '@/modules/_example/clazzManage/_router';
import clubActivity from '@/modules/_example/clubActivity/_router';
import customColumns from '@/modules/_example/customColumns/_router';
import doFilterPanel from '@/modules/_example/doFilterPanel/_router';
import nestMenus from '@/modules/_example/nestMenus/_router';
import schoolResource from '@/modules/_example/schoolResource/_router';
import schoolSelector from '@/modules/_example/schoolSelector/_router';
import simpleExample from '@/modules/_example/simpleExample/_router';
import uiKit from '@/modules/_example/uiKit/_router';
import type { RouteRecordRaw } from '@/router';

const exampleRoutes: RouteRecordRaw[] = [
  {
    path: '/example',
    name: 'ExampleModule',
    meta: {
      isHeaderTab: true,
      permission: EXAMPLE_MODULE,
    },
    component: () => import('@/modules/_example/index.vue'),
    children: [
      ...simpleExample,
      ...schoolResource,
      ...schoolSelector,
      ...clazzManage,
      ...clubActivity,
      ...uiKit,
      ...doFilterPanel,
      ...customColumns,
      ...nestMenus,
    ],
  },
];

export default exampleRoutes;
