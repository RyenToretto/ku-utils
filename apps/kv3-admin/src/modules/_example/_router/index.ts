import type { RouteRecordRaw } from 'vue-router';

import { EXAMPLE_MODULE } from '@/maps/common/dspPermission';
import clazzManage from '@/modules/_example/clazzManage/_router';
import clubActivity from '@/modules/_example/clubActivity/_router';
import customColumns from '@/modules/_example/customColumns/_router';
import nestMenus from '@/modules/_example/nestMenus/_router';
import schoolResource from '@/modules/_example/schoolResource/_router';
import simpleExample from '@/modules/_example/simpleExample/_router';
import uiKit from '@/modules/_example/uiKit/_router';

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
      ...clazzManage,
      ...clubActivity,
      ...customColumns,
      ...uiKit,
      ...nestMenus,
    ],
  },
];

export default exampleRoutes;
