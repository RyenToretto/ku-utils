import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const ClazzManageLayer = lazy(() => import('../ClazzManageLayer'));

const clazzManageRoutes: RouteObject[] = [
  {
    path: 'clazz/list',
    id: 'ExampleClazzManage',
    element: <ClazzManageLayer />,
    handle: { title: '班级管理', permission: 'EXAMPLE_MODULE' },
  },
];
export default clazzManageRoutes;
