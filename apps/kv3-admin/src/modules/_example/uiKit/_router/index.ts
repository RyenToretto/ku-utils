import type { RouteRecordRaw } from 'vue-router';

const uiKitRoutes: RouteRecordRaw[] = [
  {
    path: 'ui-kit/panel',
    name: 'ExampleUiKitPanel',
    meta: { title: '筛选 / 表格 / 分页', permission: 'EXAMPLE_MODULE' },
    component: () => import('../_module/UiKitPanelDemo.vue'),
  },
  {
    path: 'ui-kit/cells',
    name: 'ExampleUiKitCells',
    meta: { title: '单元格与编辑器', permission: 'EXAMPLE_MODULE' },
    component: () => import('../_module/UiKitCellsDemo.vue'),
  },
  {
    path: 'ui-kit/max-height',
    name: 'ExampleUiKitMaxHeight',
    meta: { title: '表格 max-height', permission: 'EXAMPLE_MODULE' },
    component: () => import('../_module/UiKitMaxHeightDemo.vue'),
  },
  {
    path: 'ui-kit/name-pattern',
    name: 'ExampleUiKitNamePattern',
    meta: { title: '命名模板', permission: 'EXAMPLE_MODULE' },
    component: () => import('../_module/UiKitNamePatternDemo.vue'),
  },
  {
    path: 'ui-kit/selector',
    name: 'ExampleUiKitDoSelector',
    meta: { title: 'DoSelector', permission: 'EXAMPLE_MODULE' },
    component: () => import('../_module/UiKitDoSelectorDemo.vue'),
  },
  {
    path: 'ui-kit/words-tag',
    name: 'ExampleUiKitWordsTag',
    meta: { title: 'WordsTag', permission: 'EXAMPLE_MODULE' },
    component: () => import('../_module/UiKitWordsTagDemo.vue'),
  },
  {
    path: 'ui-kit/preview-video',
    name: 'ExampleUiKitPreviewVideo',
    meta: { title: '预览视频', permission: 'EXAMPLE_MODULE' },
    component: () => import('../_module/UiKitPreviewVideoDemo.vue'),
  },
  {
    path: 'ui-kit/schedule-week',
    name: 'ExampleUiKitScheduleWeek',
    meta: { title: '投放时段周', permission: 'EXAMPLE_MODULE' },
    component: () => import('../_module/UiKitScheduleWeekDemo.vue'),
  },
];

export default uiKitRoutes;
