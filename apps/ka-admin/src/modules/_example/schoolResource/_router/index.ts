import type { Routes } from '@angular/router';

import type { AppRouteData } from '@/types/route-data';

const schoolResourceRoutes: Routes = [
  {
    path: 'school/list',
    loadComponent: () => import('../school-resource-layer'),
    data: {
      routeName: 'ExampleSchoolResourceManage',
      title: '学校管理',
      permission: 'EXAMPLE_MODULE',
    } satisfies AppRouteData,
  },
];

export default schoolResourceRoutes;
