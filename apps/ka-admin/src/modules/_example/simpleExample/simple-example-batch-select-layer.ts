import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SimpleExampleBatchSelectList } from './_module/simple-example-batch-select-list';

@Component({
  selector: 'ka-simple-example-batch-select-layer',
  imports: [SimpleExampleBatchSelectList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ka-simple-example-batch-select-list />',
})
export default class SimpleExampleBatchSelectLayer {}
