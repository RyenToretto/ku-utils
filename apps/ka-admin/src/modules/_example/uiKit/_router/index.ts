import type { Routes } from '@angular/router';

import type { AppRouteData } from '@/types/route-data';

const uiKitRoutes: Routes = [
  {
    path: 'ui-kit/panel',
    loadComponent: () => import('../_module/ui-kit-panel-demo'),
    data: {
      routeName: 'ExampleUiKitPanel',
      title: '筛选 / 表格 / 分页',
      permission: 'EXAMPLE_MODULE',
    } satisfies AppRouteData,
  },
  {
    path: 'ui-kit/cells',
    loadComponent: () => import('../_module/ui-kit-cells-demo'),
    data: {
      routeName: 'ExampleUiKitCells',
      title: '单元格与编辑器',
      permission: 'EXAMPLE_MODULE',
    } satisfies AppRouteData,
  },
  {
    path: 'ui-kit/max-height',
    loadComponent: () => import('../_module/ui-kit-max-height-demo'),
    data: {
      routeName: 'ExampleUiKitMaxHeight',
      title: '表格 max-height',
      permission: 'EXAMPLE_MODULE',
    } satisfies AppRouteData,
  },
  {
    path: 'ui-kit/name-pattern',
    loadComponent: () => import('../_module/ui-kit-name-pattern-demo'),
    data: {
      routeName: 'ExampleUiKitNamePattern',
      title: '命名模板',
      permission: 'EXAMPLE_MODULE',
    } satisfies AppRouteData,
  },
  {
    path: 'ui-kit/selector',
    loadComponent: () => import('../_module/ui-kit-do-selector-demo'),
    data: {
      routeName: 'ExampleUiKitDoSelector',
      title: 'DoSelector',
      permission: 'EXAMPLE_MODULE',
    } satisfies AppRouteData,
  },
  {
    path: 'ui-kit/words-tag',
    loadComponent: () => import('../_module/ui-kit-words-tag-demo'),
    data: {
      routeName: 'ExampleUiKitWordsTag',
      title: 'WordsTag',
      permission: 'EXAMPLE_MODULE',
    } satisfies AppRouteData,
  },
  {
    path: 'ui-kit/preview-video',
    loadComponent: () => import('../_module/ui-kit-preview-video-demo'),
    data: {
      routeName: 'ExampleUiKitPreviewVideo',
      title: '预览视频',
      permission: 'EXAMPLE_MODULE',
    } satisfies AppRouteData,
  },
  {
    path: 'ui-kit/schedule-week',
    loadComponent: () => import('../_module/ui-kit-schedule-week-demo'),
    data: {
      routeName: 'ExampleUiKitScheduleWeek',
      title: '投放时段周',
      permission: 'EXAMPLE_MODULE',
    } satisfies AppRouteData,
  },
];

export default uiKitRoutes;
