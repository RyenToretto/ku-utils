import type { Routes } from '@angular/router';

import type { AppRouteData } from '@/types/route-data';

const clubActivityRoutes: Routes = [
  {
    path: 'club/list',
    loadComponent: () => import('../club-activity-layer'),
    data: {
      routeName: 'ExampleClubActivityManage',
      title: '社团活动',
      permission: 'EXAMPLE_MODULE',
    } satisfies AppRouteData,
  },
];

export default clubActivityRoutes;
