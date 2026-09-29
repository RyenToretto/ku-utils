import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const SimpleExampleLayer = lazy(() => import('../SimpleExampleLayer'));
const SimpleExampleBatchSelectLayer = lazy(() => import('../SimpleExampleBatchSelectLayer'));

const simpleExampleRoutes: RouteObject[] = [
  {
    path: 'simple/list',
    id: 'SimpleExampleManage',
    element: <SimpleExampleLayer />,
    handle: { title: '示例管理', permission: 'EXAMPLE_MODULE' },
  },
  {
    path: 'simple/batch-select',
    id: 'SimpleExampleBatchSelect',
    element: <SimpleExampleBatchSelectLayer />,
    handle: { title: '表外全选（#batch）', permission: 'EXAMPLE_MODULE' },
  },
];

export default simpleExampleRoutes;
