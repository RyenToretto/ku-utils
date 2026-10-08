import type { Routes } from '@angular/router';

import type { AppRouteData } from '@/types/route-data';

const simpleExampleRoutes: Routes = [
  {
    path: 'simple/list',
    loadComponent: () => import('../simple-example-layer'),
    data: {
      routeName: 'SimpleExampleManage',
      title: '示例管理',
      permission: 'EXAMPLE_MODULE',
    } satisfies AppRouteData,
  },
  {
    path: 'simple/batch-select',
    loadComponent: () => import('../simple-example-batch-select-layer'),
    data: {
      routeName: 'SimpleExampleBatchSelect',
      title: '表外全选（#batch）',
      permission: 'EXAMPLE_MODULE',
    } satisfies AppRouteData,
  },
];

export default simpleExampleRoutes;
