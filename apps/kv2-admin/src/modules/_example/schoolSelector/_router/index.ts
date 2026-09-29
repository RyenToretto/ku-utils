import type { RouteRecordRaw } from '@/router';

const schoolSelectorRoutes: RouteRecordRaw[] = [
  {
    path: 'school-selector/demo',
    name: 'ExampleSchoolSelectorDemo',
    meta: {
      title: '学校选择器 Demo',
      permission: 'EXAMPLE_MODULE',
    },
    component: () => import('../SchoolSelectorDemoLayer.vue'),
  },
];

export default schoolSelectorRoutes;
