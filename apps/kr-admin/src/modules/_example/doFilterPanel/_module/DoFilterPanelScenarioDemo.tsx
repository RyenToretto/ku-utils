import { useMatches } from 'react-router-dom';

import SimpleExampleList from '@/modules/_example/simpleExample/_module/SimpleExampleList';
import type { AppRouteHandle } from '@/types/routeHandle';

export default function DoFilterPanelScenarioDemo() {
  const matches = useMatches();
  const handle = (matches[matches.length - 1]?.handle || {}) as AppRouteHandle;
  const scenario = handle.doFilterPanel || { buttonCount: 2, filterCount: 6, line: 2 };

  return (
    <SimpleExampleList
      filterButtonCount={scenario.buttonCount}
      filterFieldCount={scenario.filterCount}
      filterLine={scenario.line}
      fillViewportLayout={!!scenario.fillViewportLayout}
    />
  );
}
