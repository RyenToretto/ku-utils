import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const BasicColumns = lazy(() => import('../_module/01Basic/BasicColumns'));
const ElAttrsColumns = lazy(() => import('../_module/02ElAttrs/ElAttrsColumns'));
const SlotsColumns = lazy(() => import('../_module/03Slots/SlotsColumns'));
const NestedColumns = lazy(() => import('../_module/04Nested/NestedColumns'));
const VersionColumns = lazy(() => import('../_module/05Version/VersionColumns'));
const SlotComponents = lazy(() => import('../_module/06SlotComponents/SlotComponents'));
const HeaderSlots = lazy(() => import('../_module/07HeaderSlots/HeaderSlots'));
const FixedCols = lazy(() => import('../_module/08FixedCols/FixedCols'));

const customColumnsRoutes: RouteObject[] = [
  {
    path: 'custom-columns/basic',
    id: 'ExampleCustomColumnsBasic',
    element: <BasicColumns />,
    handle: { title: '01 基础用法', permission: 'EXAMPLE_MODULE' },
  },
  {
    path: 'custom-columns/el-attrs',
    id: 'ExampleCustomColumnsElAttrs',
    element: <ElAttrsColumns />,
    handle: { title: '02 elAttrs 属性透传', permission: 'EXAMPLE_MODULE' },
  },
  {
    path: 'custom-columns/slots',
    id: 'ExampleCustomColumnsSlots',
    element: <SlotsColumns />,
    handle: { title: '03 自定义 Slot', permission: 'EXAMPLE_MODULE' },
  },
  {
    path: 'custom-columns/nested',
    id: 'ExampleCustomColumnsNested',
    element: <NestedColumns />,
    handle: { title: '04 嵌套表头', permission: 'EXAMPLE_MODULE' },
  },
  {
    path: 'custom-columns/version',
    id: 'ExampleCustomColumnsVersion',
    element: <VersionColumns />,
    handle: { title: '05 版本管理', permission: 'EXAMPLE_MODULE' },
  },
  {
    path: 'custom-columns/slot-components',
    id: 'ExampleCustomColumnsSlotComponents',
    element: <SlotComponents />,
    handle: { title: '06 单元格三种写法', permission: 'EXAMPLE_MODULE' },
  },
  {
    path: 'custom-columns/header-slots',
    id: 'ExampleCustomColumnsHeaderSlots',
    element: <HeaderSlots />,
    handle: { title: '07 表头三种写法', permission: 'EXAMPLE_MODULE' },
  },
  {
    path: 'custom-columns/fixed-cols',
    id: 'ExampleCustomColumnsFixedCols',
    element: <FixedCols />,
    handle: { title: '08 固定列 schema.fixed', permission: 'EXAMPLE_MODULE' },
  },
];
export default customColumnsRoutes;
