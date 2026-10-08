import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'ka-trend-header',
  imports: [NzIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="trend-header">
      {{ label() }}
      <nz-icon nzType="fund" />
    </span>
  `,
})
export class TrendHeader {
  readonly label = input.required<string>();
}
