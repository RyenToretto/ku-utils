import type { RouteRecordRaw } from 'vue-router';

const nestMenusRoutes: RouteRecordRaw[] = [
  {
    path: 'nest-menus/a1/page-alpha',
    name: 'ExampleNestMenusPageAlpha',
    meta: {
      title: '四级 · Alpha',
      permission: 'EXAMPLE_MODULE',
      nestLevel: 4,
      nestTrail: ['一级 · 多级导航', '二级 · 业务 A', '三级 · 场景 A1', '四级 · Alpha'],
    },
    component: () => import('../NestMenusLayer.vue'),
  },
  {
    path: 'nest-menus/a1/page-beta',
    name: 'ExampleNestMenusPageBeta',
    meta: {
      title: '四级 · Beta',
      permission: 'EXAMPLE_MODULE',
      nestLevel: 4,
      nestTrail: ['一级 · 多级导航', '二级 · 业务 A', '三级 · 场景 A1', '四级 · Beta'],
    },
    component: () => import('../NestMenusLayer.vue'),
  },
  {
    path: 'nest-menus/a2/page-gamma',
    name: 'ExampleNestMenusPageGamma',
    meta: {
      title: '四级 · Gamma',
      permission: 'EXAMPLE_MODULE',
      nestLevel: 4,
      nestTrail: ['一级 · 多级导航', '二级 · 业务 A', '三级 · 场景 A2', '四级 · Gamma'],
    },
    component: () => import('../NestMenusLayer.vue'),
  },
  {
    path: 'nest-menus/b1/page-delta',
    name: 'ExampleNestMenusPageDelta',
    meta: {
      title: '四级 · Delta',
      permission: 'EXAMPLE_MODULE',
      nestLevel: 4,
      nestTrail: ['一级 · 多级导航', '二级 · 业务 B', '三级 · 场景 B1', '四级 · Delta'],
    },
    component: () => import('../NestMenusLayer.vue'),
  },
];

export default nestMenusRoutes;
