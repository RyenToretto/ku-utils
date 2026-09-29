import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const ClubActivityLayer = lazy(() => import('../ClubActivityLayer'));

const clubActivityRoutes: RouteObject[] = [
  {
    path: 'club/list',
    id: 'ExampleClubActivityManage',
    element: <ClubActivityLayer />,
    handle: { title: '社团活动', permission: 'EXAMPLE_MODULE' },
  },
];
export default clubActivityRoutes;
