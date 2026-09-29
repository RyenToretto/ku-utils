import type { RouteRecordRaw } from '@/router';

const clubActivityRoutes: RouteRecordRaw[] = [
  {
    path: 'club/list',
    name: 'ExampleClubActivityManage',
    meta: {
      title: '社团活动',
      permission: 'EXAMPLE_MODULE',
    },
    component: () => import('../ClubActivityLayer.vue'),
  },
];

export default clubActivityRoutes;
