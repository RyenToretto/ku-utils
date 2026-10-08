import type { Routes } from '@angular/router';

import type { DoFilterPanelDemoScenario } from '../_utils/do-filter-panel-demo';

import type { AppRouteData } from '@/types/route-data';

function scenarioRoute(
  path: string,
  routeName: string,
  title: string,
  desc: string,
  doFilterPanel: DoFilterPanelDemoScenario,
): Routes[number] {
  return {
    path,
    loadComponent: () => import('../_module/do-filter-panel-scenario-demo'),
    data: {
      routeName,
      title,
      desc,
      permission: 'EXAMPLE_MODULE',
      doFilterPanel,
    } satisfies AppRouteData,
  };
}

const doFilterPanelRoutes: Routes = [
  scenarioRoute(
    'do-filter-panel/buttons-1',
    'ExampleDoFilterPanelButtons1',
    '按钮×1',
    '仅主搜索按钮；6 个筛选项，折叠可见 2 行。',
    { buttonCount: 1, filterCount: 6, line: 2 },
  ),
  scenarioRoute(
    'do-filter-panel/buttons-2',
    'ExampleDoFilterPanelButtons2',
    '按钮×2',
    '搜索 + 重置；50 个筛选项。',
    { buttonCount: 2, filterCount: 50, line: 2 },
  ),
  scenarioRoute(
    'do-filter-panel/buttons-3',
    'ExampleDoFilterPanelButtons3',
    '按钮×3',
    '搜索 + 重置 + 导出；51 个筛选项。',
    { buttonCount: 3, filterCount: 51, line: 2 },
  ),
  scenarioRoute(
    'do-filter-panel/buttons-4',
    'ExampleDoFilterPanelButtons4',
    '按钮×4',
    '搜索 + 重置 + 导出 + 更多；52 个筛选项。',
    { buttonCount: 4, filterCount: 52, line: 2 },
  ),
  scenarioRoute(
    'do-filter-panel/rows-1',
    'ExampleDoFilterPanelRows1',
    '行数·少',
    '3 项筛选，折叠可见 1 行。',
    { buttonCount: 2, filterCount: 3, line: 1 },
  ),
  scenarioRoute(
    'do-filter-panel/rows-2',
    'ExampleDoFilterPanelRows2',
    '行数·中',
    '8 项筛选，折叠可见 2 行。',
    { buttonCount: 2, filterCount: 8, line: 2 },
  ),
  scenarioRoute(
    'do-filter-panel/rows-3',
    'ExampleDoFilterPanelRows3',
    '行数·多',
    '14 项筛选，折叠可见 2 行。',
    { buttonCount: 2, filterCount: 14, line: 2 },
  ),
  scenarioRoute(
    'do-filter-panel/rows-50',
    'ExampleDoFilterPanelRows50',
    '行数·50项',
    '50 项筛选，折叠可见 2 行。',
    { buttonCount: 2, filterCount: 50, line: 2 },
  ),
  scenarioRoute(
    'do-filter-panel/layout-fold',
    'ExampleDoFilterPanelLayoutFold',
    '布局折叠压表格',
    '页根 height:100% + 列 flex；展开筛选时观察表格是否被压扁。',
    { buttonCount: 2, filterCount: 50, line: 2, fillViewportLayout: true },
  ),
];

export default doFilterPanelRoutes;
