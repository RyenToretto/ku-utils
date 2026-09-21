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
  {
    path: 'simple/batch-select',
    name: 'SimpleExampleBatchSelect',
    meta: {
      title: '表外全选（#batch）',
      permission: 'EXAMPLE_MODULE',
    },
    component: () => import('../SimpleExampleBatchSelectLayer.vue'),
  },
];

export default simpleExampleRoutes;
