import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const SchoolSelectorDemoLayer = lazy(() => import('../SchoolSelectorDemoLayer'));

const schoolSelectorRoutes: RouteObject[] = [
  {
    path: 'school-selector/demo',
    id: 'ExampleSchoolSelectorDemo',
    element: <SchoolSelectorDemoLayer />,
    handle: { title: '学校选择器 Demo', permission: 'EXAMPLE_MODULE' },
  },
];
export default schoolSelectorRoutes;
