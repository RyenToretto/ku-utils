import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { format } from 'date-fns';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

export type DateRangeValue = [string, string] | [];

/** 日期/时间范围，对齐 kv3 `DateRange.vue`（nz-range-picker）。 */
@Component({
  selector: 'ka-date-range',
  imports: [FormsModule, NzDatePickerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-range-picker
      [style.width.px]="width()"
      [nzAllowClear]="clearable()"
      [nzShowTime]="isDateTime()"
      [nzFormat]="displayFormat()"
      [nzPlaceHolder]="['开始日期', '结束日期']"
      [ngModel]="parsed()"
      (ngModelChange)="onChange($event)"
    />
  `,
})
export class DateRange {
  readonly value = input<DateRangeValue | null>();
  readonly type = input<'daterange' | 'datetimerange'>('daterange');
  readonly clearable = input(true);
  readonly width = input(260);
  readonly valueChange = output<DateRangeValue>();

  protected readonly isDateTime = computed(() => this.type() === 'datetimerange');
  protected readonly displayFormat = computed(() =>
    this.isDateTime() ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd',
  );
  protected readonly parsed = computed<Date[]>(() => {
    const value = this.value();
    if (!value || value.length !== 2 || !value[0] || !value[1]) return [];
    return [new Date(value[0].replace(/-/g, '/')), new Date(value[1].replace(/-/g, '/'))];
  });

  protected onChange(dates: Date[] | null) {
    if (!dates?.[0] || !dates?.[1]) {
      this.valueChange.emit([]);
      return;
    }
    const fmt = this.displayFormat();
    this.valueChange.emit([format(dates[0], fmt), format(dates[1], fmt)]);
  }
}
