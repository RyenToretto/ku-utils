import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SchoolResourceList } from './_module/school-resource-list';

@Component({
  selector: 'ka-school-resource-layer',
  imports: [SchoolResourceList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ka-school-resource-list />',
})
export default class SchoolResourceLayer {}
