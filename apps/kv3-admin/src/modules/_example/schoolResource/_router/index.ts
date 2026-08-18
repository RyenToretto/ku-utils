import type { RouteRecordRaw } from 'vue-router';

const schoolResourceRoutes: RouteRecordRaw[] = [
  {
    path: 'school/list',
    name: 'ExampleSchoolResourceManage',
    meta: {
      title: '学校管理',
      permission: 'EXAMPLE_MODULE',
    },
    component: () => import('../SchoolResourceLayer.vue'),
  },
];

export default schoolResourceRoutes;
