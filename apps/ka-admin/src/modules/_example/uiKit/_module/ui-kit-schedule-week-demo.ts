import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';

import { ScheduleTimeWeekPicker } from '@/components/schedule-time-week-picker';
import {
  EMPTY_SCHEDULE_TIME,
  normalizeScheduleTimeBitmap,
  SCHEDULE_TIME_LENGTH,
  SCHEDULE_TIME_SLOTS_PER_DAY,
} from '@/utils/schedule-time';

@Component({
  selector: 'ka-ui-kit-schedule-week-demo',
  imports: [NzButtonModule, NzCardModule, ScheduleTimeWeekPicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-ui-kit-schedule-week' },
  template: `
    <nz-card
      nzSize="small"
      class="ui-kit-demo-card"
    >
      <h3>投放时段周网格</h3>
      <ka-schedule-time-week-picker
        [value]="bitmap()"
        (valueChange)="bitmap.set($event)"
      />
      <div class="ui-kit-demo-actions">
        <button
          nz-button
          (click)="bitmap.set(empty)"
        >
          清空
        </button>
        <button
          nz-button
          nzType="primary"
          (click)="fillWeekdaysMorning()"
        >
          工作日上午预设
        </button>
      </div>
      <p class="ui-kit-demo-hint">位图长度：{{ bitmap().length }}</p>
      <p class="ui-kit-demo-hint ui-kit-demo-mono">{{ bitmapPreview() }}</p>
    </nz-card>
  `,
})
export default class UiKitScheduleWeekDemo {
  protected readonly empty = EMPTY_SCHEDULE_TIME;
  protected readonly bitmap = signal(EMPTY_SCHEDULE_TIME);
  protected readonly bitmapPreview = computed(() => {
    const ones = normalizeScheduleTimeBitmap(this.bitmap())
      .split('')
      .filter((c) => c === '1').length;
    return `${ones} / ${SCHEDULE_TIME_LENGTH}`;
  });

  /** Demo：周一至周五 09:00–12:00 */
  protected fillWeekdaysMorning() {
    const chars = EMPTY_SCHEDULE_TIME.split('');
    for (let day = 0; day < 5; day += 1) {
      const dayStart = day * SCHEDULE_TIME_SLOTS_PER_DAY;
      for (let slot = 18; slot < 24; slot += 1) chars[dayStart + slot] = '1';
    }
    this.bitmap.set(chars.join(''));
  }
}
