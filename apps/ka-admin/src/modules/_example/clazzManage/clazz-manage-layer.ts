import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ClazzManageList } from './_module/clazz-manage-list';

@Component({
  selector: 'ka-clazz-manage-layer',
  imports: [ClazzManageList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ka-clazz-manage-list />',
})
export default class ClazzManageLayer {}
