import type { MockMethod } from '@/mock/_types';
import { ok } from '@/mock/utils';

/** 硬编码 10 条自定义列演示数据 */
const CUSTOM_COLUMN_ROWS = [
  { id: 1, name: '素材A', amount: 1200, score: 88, cost: 320.5, roi: 1.82, rate: 0.126 },
  { id: 2, name: '素材B', amount: 860, score: 76, cost: 210.0, roi: 1.45, rate: 0.098 },
  { id: 3, name: '素材C', amount: 1540, score: 91, cost: 410.2, roi: 2.01, rate: 0.152 },
  { id: 4, name: '素材D', amount: 640, score: 70, cost: 180.8, roi: 1.22, rate: 0.084 },
  { id: 5, name: '素材E', amount: 990, score: 83, cost: 265.3, roi: 1.66, rate: 0.111 },
  { id: 6, name: '素材F', amount: 1120, score: 85, cost: 300.1, roi: 1.74, rate: 0.119 },
  { id: 7, name: '素材G', amount: 730, score: 72, cost: 195.6, roi: 1.31, rate: 0.091 },
  { id: 8, name: '素材H', amount: 1680, score: 94, cost: 455.0, roi: 2.15, rate: 0.161 },
  { id: 9, name: '素材I', amount: 520, score: 68, cost: 150.4, roi: 1.18, rate: 0.077 },
  { id: 10, name: '素材J', amount: 1330, score: 89, cost: 360.9, roi: 1.93, rate: 0.138 },
];

const customColumnsMock: MockMethod[] = [
  {
    url: '/api/example/custom-columns/list',
    method: 'GET',
    response: () =>
      ok({
        lists: CUSTOM_COLUMN_ROWS,
        total: CUSTOM_COLUMN_ROWS.length,
      }),
  },
];

export default customColumnsMock;
