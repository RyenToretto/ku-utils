import type { Routes } from '@angular/router';

import type { AppRouteData } from '@/types/route-data';

function leafRoute(
  path: string,
  routeName: string,
  title: string,
  nestTrail: string[],
): Routes[number] {
  return {
    path,
    loadComponent: () => import('../nest-menus-layer'),
    data: {
      routeName,
      title,
      permission: 'EXAMPLE_MODULE',
      nestLevel: nestTrail.length,
      nestTrail,
    } satisfies AppRouteData,
  };
}

const nestMenusRoutes: Routes = [
  leafRoute('nest-menus/a1/page-alpha', 'ExampleNestMenusPageAlpha', '四级 · Alpha', [
    '一级 · 多级导航',
    '二级 · 业务 A',
    '三级 · 场景 A1',
    '四级 · Alpha',
  ]),
  leafRoute('nest-menus/a1/page-beta', 'ExampleNestMenusPageBeta', '四级 · Beta', [
    '一级 · 多级导航',
    '二级 · 业务 A',
    '三级 · 场景 A1',
    '四级 · Beta',
  ]),
  leafRoute('nest-menus/a2/page-gamma', 'ExampleNestMenusPageGamma', '四级 · Gamma', [
    '一级 · 多级导航',
    '二级 · 业务 A',
    '三级 · 场景 A2',
    '四级 · Gamma',
  ]),
  leafRoute('nest-menus/b1/page-delta', 'ExampleNestMenusPageDelta', '四级 · Delta', [
    '一级 · 多级导航',
    '二级 · 业务 B',
    '三级 · 场景 B1',
    '四级 · Delta',
  ]),
];

export default nestMenusRoutes;
