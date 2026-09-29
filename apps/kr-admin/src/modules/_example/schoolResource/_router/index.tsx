import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const SchoolResourceLayer = lazy(() => import('../SchoolResourceLayer'));

const schoolResourceRoutes: RouteObject[] = [
  {
    path: 'school/list',
    id: 'ExampleSchoolResourceManage',
    element: <SchoolResourceLayer />,
    handle: { title: '学校管理', permission: 'EXAMPLE_MODULE' },
  },
];
export default schoolResourceRoutes;
