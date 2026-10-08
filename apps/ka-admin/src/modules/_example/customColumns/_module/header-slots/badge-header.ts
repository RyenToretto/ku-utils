import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'ka-badge-header',
  imports: [NzTagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="badge-header">
      {{ label() }}
      <nz-tag nzColor="warning">HOT</nz-tag>
    </span>
  `,
})
export class BadgeHeader {
  readonly label = input.required<string>();
}
