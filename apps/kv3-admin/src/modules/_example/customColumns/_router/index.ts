import type { RouteRecordRaw } from 'vue-router';

const customColumnsRoutes: RouteRecordRaw[] = [
  {
    path: 'custom-columns/basic',
    name: 'ExampleCustomColumnsBasic',
    meta: { title: '01 基础用法', permission: 'EXAMPLE_MODULE' },
    component: () => import('../_module/01Basic/BasicColumns.vue'),
  },
  {
    path: 'custom-columns/el-attrs',
    name: 'ExampleCustomColumnsElAttrs',
    meta: { title: '02 elAttrs 属性透传', permission: 'EXAMPLE_MODULE' },
    component: () => import('../_module/02ElAttrs/ElAttrsColumns.vue'),
  },
  {
    path: 'custom-columns/slots',
    name: 'ExampleCustomColumnsSlots',
    meta: { title: '03 自定义 Slot', permission: 'EXAMPLE_MODULE' },
    component: () => import('../_module/03Slots/SlotsColumns.vue'),
  },
  {
    path: 'custom-columns/nested',
    name: 'ExampleCustomColumnsNested',
    meta: { title: '04 嵌套表头', permission: 'EXAMPLE_MODULE' },
    component: () => import('../_module/04Nested/NestedColumns.vue'),
  },
  {
    path: 'custom-columns/version',
    name: 'ExampleCustomColumnsVersion',
    meta: { title: '05 版本管理', permission: 'EXAMPLE_MODULE' },
    component: () => import('../_module/05Version/VersionColumns.vue'),
  },
  {
    path: 'custom-columns/slot-components',
    name: 'ExampleCustomColumnsSlotComponents',
    meta: { title: '06 单元格三种写法', permission: 'EXAMPLE_MODULE' },
    component: () => import('../_module/06SlotComponents/SlotComponents.vue'),
  },
  {
    path: 'custom-columns/header-slots',
    name: 'ExampleCustomColumnsHeaderSlots',
    meta: { title: '07 表头三种写法', permission: 'EXAMPLE_MODULE' },
    component: () => import('../_module/07HeaderSlots/HeaderSlots.vue'),
  },
  {
    path: 'custom-columns/fixed-cols',
    name: 'ExampleCustomColumnsFixedCols',
    meta: { title: '08 固定列 schema.fixed', permission: 'EXAMPLE_MODULE' },
    component: () => import('../_module/08FixedCols/FixedCols.vue'),
  },
];

export default customColumnsRoutes;
