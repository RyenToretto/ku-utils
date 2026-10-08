import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { DoFilterPanelDemoScenario } from '../_utils/do-filter-panel-demo';

import { SimpleExampleList } from '@/modules/_example/simpleExample/_module/simple-example-list';

const DEFAULT_SCENARIO: DoFilterPanelDemoScenario = { buttonCount: 2, filterCount: 6, line: 2 };

/** 场景参数来自路由 `data.doFilterPanel`（`withComponentInputBinding` 绑定为输入） */
@Component({
  selector: 'ka-do-filter-panel-scenario-demo',
  imports: [SimpleExampleList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ka-simple-example-list
      [filterButtonCount]="scenario().buttonCount"
      [filterFieldCount]="scenario().filterCount"
      [filterLine]="scenario().line"
      [fillViewportLayout]="!!scenario().fillViewportLayout"
    />
  `,
})
export default class DoFilterPanelScenarioDemo {
  readonly doFilterPanel = input<DoFilterPanelDemoScenario>();
  protected readonly scenario = computed(() => this.doFilterPanel() ?? DEFAULT_SCENARIO);
}
