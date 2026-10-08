import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

import type { RowSelectorStatus } from '@/composables/inject-row-selector';

/** 表头批量勾选框（全选 / 半选 / 未选）；纯展示，点击由调用方绑定原生 `(click)` */
@Component({
  selector: 'ka-do-select-batch-box',
  imports: [NzIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'do-select-cell batch-select-box',
    '[class.all-selected]': "status() === 'all-selected'",
    '[class.half-selected]': "status() === 'half-selected'",
    '[class.none-selected]': "status() === 'none-selected'",
    '[class.active]': "status() !== 'none-selected'",
  },
  template: `
    @if (status() === 'all-selected') {
      <nz-icon nzType="check" />
    }
    @if (status() === 'half-selected') {
      <nz-icon nzType="minus" />
    }
  `,
})
export class DoSelectBatchBox {
  readonly status = input.required<RowSelectorStatus>();
}

/** 行勾选单元格：多选方框 / 单选圆点 */
@Component({
  selector: 'ka-do-select-cell',
  imports: [NzIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'do-select-cell',
    '[class.active]': 'active()',
    '[class.single]': 'single()',
    '[class.transparent]': 'transparent()',
    '(click)': 'onClick($event)',
  },
  template: '<nz-icon nzType="check" />',
})
export class DoSelectCell {
  readonly active = input(false);
  readonly single = input(false);
  readonly transparent = input(false);
  readonly choose = output<void>();

  protected onClick(event: MouseEvent) {
    event.stopPropagation();
    this.choose.emit();
  }
}
