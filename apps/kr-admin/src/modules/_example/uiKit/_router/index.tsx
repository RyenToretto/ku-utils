import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const UiKitPanelDemo = lazy(() => import('../_module/UiKitPanelDemo'));
const UiKitCellsDemo = lazy(() => import('../_module/UiKitCellsDemo'));
const UiKitMaxHeightDemo = lazy(() => import('../_module/UiKitMaxHeightDemo'));
const UiKitNamePatternDemo = lazy(() => import('../_module/UiKitNamePatternDemo'));
const UiKitDoSelectorDemo = lazy(() => import('../_module/UiKitDoSelectorDemo'));
const UiKitWordsTagDemo = lazy(() => import('../_module/UiKitWordsTagDemo'));
const UiKitPreviewVideoDemo = lazy(() => import('../_module/UiKitPreviewVideoDemo'));
const UiKitScheduleWeekDemo = lazy(() => import('../_module/UiKitScheduleWeekDemo'));

const uiKitRoutes: RouteObject[] = [
  {
    path: 'ui-kit/panel',
    id: 'ExampleUiKitPanel',
    element: <UiKitPanelDemo />,
    handle: { title: '筛选 / 表格 / 分页', permission: 'EXAMPLE_MODULE' },
  },
  {
    path: 'ui-kit/cells',
    id: 'ExampleUiKitCells',
    element: <UiKitCellsDemo />,
    handle: { title: '单元格与编辑器', permission: 'EXAMPLE_MODULE' },
  },
  {
    path: 'ui-kit/max-height',
    id: 'ExampleUiKitMaxHeight',
    element: <UiKitMaxHeightDemo />,
    handle: { title: '表格 max-height', permission: 'EXAMPLE_MODULE' },
  },
  {
    path: 'ui-kit/name-pattern',
    id: 'ExampleUiKitNamePattern',
    element: <UiKitNamePatternDemo />,
    handle: { title: '命名模板', permission: 'EXAMPLE_MODULE' },
  },
  {
    path: 'ui-kit/selector',
    id: 'ExampleUiKitDoSelector',
    element: <UiKitDoSelectorDemo />,
    handle: { title: 'DoSelector', permission: 'EXAMPLE_MODULE' },
  },
  {
    path: 'ui-kit/words-tag',
    id: 'ExampleUiKitWordsTag',
    element: <UiKitWordsTagDemo />,
    handle: { title: 'WordsTag', permission: 'EXAMPLE_MODULE' },
  },
  {
    path: 'ui-kit/preview-video',
    id: 'ExampleUiKitPreviewVideo',
    element: <UiKitPreviewVideoDemo />,
    handle: { title: '预览视频', permission: 'EXAMPLE_MODULE' },
  },
  {
    path: 'ui-kit/schedule-week',
    id: 'ExampleUiKitScheduleWeek',
    element: <UiKitScheduleWeekDemo />,
    handle: { title: '投放时段周', permission: 'EXAMPLE_MODULE' },
  },
];
export default uiKitRoutes;
