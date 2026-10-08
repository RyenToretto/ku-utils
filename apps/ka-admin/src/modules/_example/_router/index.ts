import type { Routes } from '@angular/router';

import { firstLeafPath } from '@/layouts/side-menu/side-menu-tree';
import { EXAMPLE_MODULE } from '@/maps/common/dsp-permission';
import clazzManage from '@/modules/_example/clazzManage/_router';
import clubActivity from '@/modules/_example/clubActivity/_router';
import doFilterPanel from '@/modules/_example/doFilterPanel/_router';
import { EXAMPLE_MENUS } from '@/modules/_example/menus';
import nestMenus from '@/modules/_example/nestMenus/_router';
import schoolResource from '@/modules/_example/schoolResource/_router';
import schoolSelector from '@/modules/_example/schoolSelector/_router';
import simpleExample from '@/modules/_example/simpleExample/_router';
import uiKit from '@/modules/_example/uiKit/_router';
import type { AppRouteData } from '@/types/route-data';

const exampleRoutes: Routes = [
  {
    path: 'example',
    loadComponent: () => import('@/modules/_example/index'),
    data: {
      routeName: 'ExampleModule',
      isHeaderTab: true,
      permission: EXAMPLE_MODULE,
    } satisfies AppRouteData,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: firstLeafPath(EXAMPLE_MENUS[0]) ?? '/example',
      },
      ...simpleExample,
      ...schoolResource,
      ...schoolSelector,
      ...clazzManage,
      ...clubActivity,
      ...uiKit,
      ...doFilterPanel,
      ...nestMenus,
    ],
  },
];

export default exampleRoutes;
