import type { RouteRecordRaw } from '@/router';

const clazzManageRoutes: RouteRecordRaw[] = [
  {
    path: 'clazz/list',
    name: 'ExampleClazzManage',
    meta: {
      title: '班级管理',
      permission: 'EXAMPLE_MODULE',
    },
    component: () => import('../ClazzManageLayer.vue'),
  },
];

export default clazzManageRoutes;
