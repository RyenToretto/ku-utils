import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const NestMenusLayer = lazy(() => import('../NestMenusLayer'));

const nestMenusRoutes: RouteObject[] = [
  {
    path: 'nest-menus/a1/page-alpha',
    id: 'ExampleNestMenusPageAlpha',
    element: <NestMenusLayer />,
    handle: {
      title: '四级 · Alpha',
      permission: 'EXAMPLE_MODULE',
      nestLevel: 4,
      nestTrail: ['一级 · 多级导航', '二级 · 业务 A', '三级 · 场景 A1', '四级 · Alpha'],
    },
  },
  {
    path: 'nest-menus/a1/page-beta',
    id: 'ExampleNestMenusPageBeta',
    element: <NestMenusLayer />,
    handle: {
      title: '四级 · Beta',
      permission: 'EXAMPLE_MODULE',
      nestLevel: 4,
      nestTrail: ['一级 · 多级导航', '二级 · 业务 A', '三级 · 场景 A1', '四级 · Beta'],
    },
  },
  {
    path: 'nest-menus/a2/page-gamma',
    id: 'ExampleNestMenusPageGamma',
    element: <NestMenusLayer />,
    handle: {
      title: '四级 · Gamma',
      permission: 'EXAMPLE_MODULE',
      nestLevel: 4,
      nestTrail: ['一级 · 多级导航', '二级 · 业务 A', '三级 · 场景 A2', '四级 · Gamma'],
    },
  },
  {
    path: 'nest-menus/b1/page-delta',
    id: 'ExampleNestMenusPageDelta',
    element: <NestMenusLayer />,
    handle: {
      title: '四级 · Delta',
      permission: 'EXAMPLE_MODULE',
      nestLevel: 4,
      nestTrail: ['一级 · 多级导航', '二级 · 业务 B', '三级 · 场景 B1', '四级 · Delta'],
    },
  },
];
export default nestMenusRoutes;
