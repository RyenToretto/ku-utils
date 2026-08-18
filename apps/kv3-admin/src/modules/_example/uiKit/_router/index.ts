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
];

export default uiKitRoutes;
