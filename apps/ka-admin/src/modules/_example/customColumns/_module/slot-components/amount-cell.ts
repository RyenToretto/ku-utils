import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ka-amount-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div class="amount-cell">{{ text() }}</div>',
})
export class AmountCell {
  readonly row = input.required<Record<string, unknown>>();
  readonly prop = input('amount');

  protected readonly text = computed(() => {
    const val = this.row()[this.prop()];
    if (val == null || val === '') return '—';
    return Number(val).toLocaleString('zh-CN');
  });
}
