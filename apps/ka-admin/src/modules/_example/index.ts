import { ChangeDetectionStrategy, Component } from '@angular/core';

import { EXAMPLE_MENUS } from './menus';

import { DomainModuleShell } from '@/layouts/domain-module-shell';

@Component({
  selector: 'ka-example-module',
  imports: [DomainModuleShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: '<ka-domain-module-shell [menus]="menus" />',
})
export default class ExampleModule {
  protected readonly menus = EXAMPLE_MENUS;
}
