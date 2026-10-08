import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

import {
  EMPTY_SCHEDULE_TIME,
  SCHEDULE_TIME_LENGTH,
  SCHEDULE_TIME_SLOTS_PER_DAY,
  buildScheduleTimeBoundaryLabels,
  formatScheduleTimeDaySummaries,
  normalizeScheduleTimeBitmap,
} from '@/utils/schedule-time';

const WEEK_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const CELL_INDICES = Array.from({ length: SCHEDULE_TIME_LENGTH }, (_, i) => i);
const SLOTS_PER_DAY = SCHEDULE_TIME_SLOTS_PER_DAY;
const BOUNDARY_LABELS = buildScheduleTimeBoundaryLabels();

type Axis = {
  startx?: number;
  starty?: number;
  endx?: number;
  endy?: number;
};

function parseIndex(raw: string | null | undefined) {
  if (raw == null || raw === '') return null;
  const index = Number(raw);
  if (!Number.isInteger(index) || index < 0 || index >= SCHEDULE_TIME_LENGTH) return null;
  return index;
}

function readIndex(event: MouseEvent) {
  const hit = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
  const cell = hit?.closest?.('[data-index]') as HTMLElement | null;
  return parseIndex(cell?.getAttribute('data-index'));
}

function cellTitle(index: number) {
  const slot = index % SLOTS_PER_DAY;
  const day = Math.floor(index / SLOTS_PER_DAY);
  return `${WEEK_LABELS[day] || ''} ${BOUNDARY_LABELS[slot]}~${BOUNDARY_LABELS[slot + 1]}`;
}

/** 投放时段周网格，对齐 kv3 `ScheduleTimeWeekPicker.vue`（336 位半小时位图）。 */
@Component({
  selector: 'ka-schedule-time-week-picker',
  imports: [NzTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'schedule-time-week-picker' },
  template: `
    <div class="schedule-time-week-picker-inner">
      <div class="schedule-time-week-picker-main">
        <div class="schedule-time-week-picker-hd">
          <div class="schedule-time-week-picker-hd-title">时段</div>
          <div class="schedule-time-week-picker-hd-con">
            <div class="schedule-time-week-picker-hd-ranges">
              <div class="schedule-time-week-picker-range">00:00 - 12:00</div>
              <div class="schedule-time-week-picker-range">12:00 - 24:00</div>
            </div>
            <div class="schedule-time-week-picker-hd-hours">
              @for (hour of hours; track hour) {
                <span class="schedule-time-week-picker-hour-label">{{ hour }}</span>
              }
            </div>
          </div>
        </div>

        <div class="schedule-time-week-picker-bd">
          <div class="schedule-time-week-picker-weeks">
            @for (weekLabel of weekLabels; track $index) {
              <div class="schedule-time-week-picker-week">{{ weekLabel }}</div>
            }
          </div>
          <div
            class="schedule-time-week-picker-cells"
            (mousedown)="onCellMouseDown($event)"
            (mousemove)="onCellMouseMove($event)"
          >
            @for (cellIndex of cellIndices; track cellIndex) {
              <div
                class="schedule-time-week-picker-cell"
                [class.is-active]="bits()[cellIndex] === '1'"
                [class.is-preview]="previewSet().has(cellIndex)"
                [attr.data-index]="cellIndex"
                nz-tooltip
                nzTooltipPlacement="top"
                [nzTooltipTitle]="cellTitle(cellIndex)"
                [nzTooltipMouseEnterDelay]="0.8"
                [nzTooltipVisible]="isMove() ? false : undefined"
              ></div>
            }
          </div>
        </div>
      </div>

      <div class="schedule-time-week-picker-help">
        <div class="schedule-time-week-picker-help-bar">
          <div class="schedule-time-week-picker-legend">
            <span class="schedule-time-week-picker-swatch"></span>
            <span class="schedule-time-week-picker-legend-text">未选</span>
            <span class="schedule-time-week-picker-swatch is-active"></span>
            <span class="schedule-time-week-picker-legend-text">已选</span>
          </div>
          <button
            type="button"
            class="schedule-time-week-picker-clear"
            (click)="emitValue(emptyValue)"
          >
            清空
          </button>
        </div>
        @if (daySummaries().length > 0) {
          <div class="schedule-time-week-picker-summary">
            @for (row of daySummaries(); track row.label) {
              <p class="schedule-time-week-picker-summary-row">
                <span class="schedule-time-week-picker-summary-day">{{ row.label }}：</span>
                <span>{{ row.text }}</span>
              </p>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class ScheduleTimeWeekPicker {
  readonly value = input<string | null>();
  readonly valueChange = output<string>();

  protected readonly hours = HOURS;
  protected readonly weekLabels = WEEK_LABELS;
  protected readonly cellIndices = CELL_INDICES;
  protected readonly cellTitle = cellTitle;
  protected readonly emptyValue = EMPTY_SCHEDULE_TIME;

  protected readonly bits = signal(normalizeScheduleTimeBitmap(null));
  protected readonly isMove = signal(false);
  private readonly previewIndexes = signal<number[]>([]);
  protected readonly previewSet = computed(() => new Set(this.previewIndexes()));
  protected readonly daySummaries = computed(() =>
    formatScheduleTimeDaySummaries(this.bits(), WEEK_LABELS),
  );
  private startIndex = -1;
  private axis: Axis = {};

  constructor() {
    effect(() => {
      const next = normalizeScheduleTimeBitmap(this.value());
      untracked(() => {
        if (next !== this.bits()) this.bits.set(next);
      });
    });

    const onDocMouseUp = (event: MouseEvent) => this.resetMousemove(event);
    document.addEventListener('mouseup', onDocMouseUp);
    inject(DestroyRef).onDestroy(() => document.removeEventListener('mouseup', onDocMouseUp));
  }

  protected emitValue(next: string) {
    this.bits.set(next);
    this.valueChange.emit(next);
  }

  private getSelectIndexes() {
    const { startx, starty, endx, endy } = this.axis;
    if (startx == null || starty == null) return [] as number[];
    const ex = endx ?? startx;
    const ey = endy ?? starty;
    const list: number[] = [];
    for (let y = Math.min(starty, ey); y <= Math.max(starty, ey); y++) {
      for (let x = Math.min(startx, ex); x <= Math.max(startx, ex); x++) {
        list.push(x + y * SLOTS_PER_DAY);
      }
    }
    return list;
  }

  private applySelectIndexes(indexList: number[]) {
    if (!indexList.length || this.startIndex < 0) return;
    const bits = this.bits();
    const newData = bits[this.startIndex] === '1' ? '0' : '1';
    const chars = bits.split('');
    for (const index of indexList) chars[index] = newData;
    this.emitValue(chars.join(''));
  }

  protected onCellMouseDown(event: MouseEvent) {
    event.preventDefault();
    const index = readIndex(event);
    if (index == null) return;
    this.isMove.set(true);
    this.startIndex = index;
    const x = index % SLOTS_PER_DAY;
    const y = Math.floor(index / SLOTS_PER_DAY);
    this.axis = { startx: x, starty: y, endx: x, endy: y };
    this.previewIndexes.set(this.getSelectIndexes());
  }

  protected onCellMouseMove(event: MouseEvent) {
    if (!this.isMove()) return;
    const index = readIndex(event);
    if (index == null) return;
    this.axis = {
      ...this.axis,
      endx: index % SLOTS_PER_DAY,
      endy: Math.floor(index / SLOTS_PER_DAY),
    };
    this.previewIndexes.set(this.getSelectIndexes());
  }

  private resetMousemove(event?: MouseEvent) {
    if (!this.isMove()) return;
    if (event) {
      const index = readIndex(event);
      if (index != null) {
        this.axis = {
          ...this.axis,
          endx: index % SLOTS_PER_DAY,
          endy: Math.floor(index / SLOTS_PER_DAY),
        };
      }
    }
    this.applySelectIndexes(this.getSelectIndexes());
    this.isMove.set(false);
    this.startIndex = -1;
    this.axis = {};
    this.previewIndexes.set([]);
  }
}
