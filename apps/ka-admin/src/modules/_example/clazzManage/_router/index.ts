import type { Routes } from '@angular/router';

import type { AppRouteData } from '@/types/route-data';

const clazzManageRoutes: Routes = [
  {
    path: 'clazz/list',
    loadComponent: () => import('../clazz-manage-layer'),
    data: {
      routeName: 'ExampleClazzManage',
      title: '班级管理',
      permission: 'EXAMPLE_MODULE',
    } satisfies AppRouteData,
  },
];

export default clazzManageRoutes;
