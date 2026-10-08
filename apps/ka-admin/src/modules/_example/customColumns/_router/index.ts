import type { Routes } from '@angular/router';

import type { AppRouteData } from '@/types/route-data';

const customColumnsRoutes: Routes = [
  {
    path: 'custom-columns/basic',
    loadComponent: () => import('../_module/basic-columns'),
    data: {
      routeName: 'ExampleCustomColumnsBasic',
      title: '01 基础用法',
      permission: 'EXAMPLE_MODULE',
    } satisfies AppRouteData,
  },
  {
    path: 'custom-columns/el-attrs',
    loadComponent: () => import('../_module/el-attrs-columns'),
    data: {
      routeName: 'ExampleCustomColumnsElAttrs',
      title: '02 elAttrs 属性透传',
      permission: 'EXAMPLE_MODULE',
    } satisfies AppRouteData,
  },
  {
    path: 'custom-columns/slots',
    loadComponent: () => import('../_module/slots-columns'),
    data: {
      routeName: 'ExampleCustomColumnsSlots',
      title: '03 自定义 Slot',
      permission: 'EXAMPLE_MODULE',
    } satisfies AppRouteData,
  },
  {
    path: 'custom-columns/nested',
    loadComponent: () => import('../_module/nested-columns'),
    data: {
      routeName: 'ExampleCustomColumnsNested',
      title: '04 嵌套表头',
      permission: 'EXAMPLE_MODULE',
    } satisfies AppRouteData,
  },
  {
    path: 'custom-columns/version',
    loadComponent: () => import('../_module/version-columns'),
    data: {
      routeName: 'ExampleCustomColumnsVersion',
      title: '05 版本管理',
      permission: 'EXAMPLE_MODULE',
    } satisfies AppRouteData,
  },
  {
    path: 'custom-columns/slot-components',
    loadComponent: () => import('../_module/slot-components/slot-components'),
    data: {
      routeName: 'ExampleCustomColumnsSlotComponents',
      title: '06 单元格三种写法',
      permission: 'EXAMPLE_MODULE',
    } satisfies AppRouteData,
  },
  {
    path: 'custom-columns/header-slots',
    loadComponent: () => import('../_module/header-slots/header-slots'),
    data: {
      routeName: 'ExampleCustomColumnsHeaderSlots',
      title: '07 表头三种写法',
      permission: 'EXAMPLE_MODULE',
    } satisfies AppRouteData,
  },
  {
    path: 'custom-columns/fixed-cols',
    loadComponent: () => import('../_module/fixed-cols'),
    data: {
      routeName: 'ExampleCustomColumnsFixedCols',
      title: '08 固定列 schema.fixed',
      permission: 'EXAMPLE_MODULE',
    } satisfies AppRouteData,
  },
];

export default customColumnsRoutes;
