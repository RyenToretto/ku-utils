import type { RouteRecordRaw } from 'vue-router';

const simpleExampleRoutes: RouteRecordRaw[] = [
  {
    path: 'simple/list',
    name: 'SimpleExampleManage',
    meta: {
      title: '示例管理',
      permission: 'EXAMPLE_MODULE',
    },
    component: () => import('../SimpleExampleLayer.vue'),
  },
];

export default simpleExampleRoutes;
