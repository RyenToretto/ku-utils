import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SimpleExampleList } from './_module/simple-example-list';

@Component({
  selector: 'ka-simple-example-layer',
  imports: [SimpleExampleList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ka-simple-example-list />',
})
export default class SimpleExampleLayer {}
