import type { Routes } from '@angular/router';

import type { AppRouteData } from '@/types/route-data';

const schoolSelectorRoutes: Routes = [
  {
    path: 'school-selector/demo',
    loadComponent: () => import('../school-selector-demo-layer'),
    data: {
      routeName: 'ExampleSchoolSelectorDemo',
      title: '学校选择器 Demo',
      permission: 'EXAMPLE_MODULE',
    } satisfies AppRouteData,
  },
];

export default schoolSelectorRoutes;
