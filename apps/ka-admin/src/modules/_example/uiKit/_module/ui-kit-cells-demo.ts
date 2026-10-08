import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpaceModule } from 'ng-zorro-antd/space';

import { CellDateTime } from '@/components/cell-date-time';
import { CellState, type StateValue } from '@/components/cell-state';
import { DateRange, type DateRangeValue } from '@/components/date-range';
import { DoNumberSetter } from '@/components/do-number-setter';
import { DoSelector, type DoSelectorValue } from '@/components/do-selector';
import { DoTxtSetter } from '@/components/do-txt-setter';

const SAMPLE_TIME = '2026-08-06 19:43:02';
const CITY_OPTIONS = [
  { value: 'bj', label: '北京' },
  { value: 'sh', label: '上海' },
  { value: 'gz', label: '广州' },
];

@Component({
  selector: 'ka-ui-kit-cells-demo',
  imports: [
    CellDateTime,
    CellState,
    DateRange,
    DoNumberSetter,
    DoSelector,
    DoTxtSetter,
    NzCardModule,
    NzSpaceModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-ui-kit-cells' },
  template: `
    <nz-card
      nzSize="small"
      nzTitle="CellState"
      class="demo-card"
    >
      <div class="demo-row">
        <ka-cell-state [modelValue]="1" />
        <ka-cell-state [modelValue]="0" />
        <ka-cell-state
          [modelValue]="switchValue()"
          [switchable]="true"
          [switching]="switching()"
          (switchChange)="onSwitch($event)"
        />
      </div>
    </nz-card>

    <nz-card
      nzSize="small"
      nzTitle="CellDateTime"
      class="demo-card"
    >
      <div class="demo-row demo-datetime">
        <div>
          <div class="demo-label">stacked</div>
          <ka-cell-date-time [value]="sampleTime" />
        </div>
        <div>
          <div class="demo-label">compact</div>
          <ka-cell-date-time
            layout="compact"
            [value]="sampleTime"
          />
        </div>
        <div>
          <div class="demo-label">with-actor</div>
          <ka-cell-date-time
            layout="with-actor"
            actor="zhengwenwen"
            [value]="sampleTime"
          />
        </div>
        <div>
          <div class="demo-label">dateOnly</div>
          <ka-cell-date-time
            [dateOnly]="true"
            [value]="sampleTime"
          />
        </div>
        <div>
          <div class="demo-label">inline</div>
          <ka-cell-date-time
            variant="inline"
            [value]="sampleTime"
          />
        </div>
      </div>
    </nz-card>

    <nz-card
      nzSize="small"
      nzTitle="DateRange / DoSelector"
      class="demo-card"
    >
      <div class="demo-row">
        <ka-date-range
          [value]="dateRange()"
          (valueChange)="dateRange.set($event)"
        />
        <ka-do-selector
          width="180px"
          [value]="selectorValue()"
          [options]="cityOptions"
          (valueChange)="onSelectorChange($event)"
        />
        <span class="demo-hint">
          已选：{{ selectorValue() || '—' }} /
          {{ dateRange().length === 2 ? dateRange().join(' ~ ') : '—' }}
        </span>
      </div>
    </nz-card>

    <nz-card
      nzSize="small"
      nzTitle="DoNumberSetter / DoTxtSetter"
      class="demo-card"
    >
      <nz-space
        class="demo-row"
        nzSize="large"
      >
        <ka-do-number-setter
          *nzSpaceItem
          [num]="score()"
          [newValue]="score()"
          [ok]="onScoreOk"
        >
          评分 {{ score() }}
        </ka-do-number-setter>
        <ka-do-txt-setter
          *nzSpaceItem
          [inline]="true"
          [initValue]="title()"
          [ok]="onTitleOk"
        >
          <span>{{ title() }}</span>
        </ka-do-txt-setter>
      </nz-space>
    </nz-card>
  `,
})
export default class UiKitCellsDemo {
  private readonly message = inject(NzMessageService);
  protected readonly sampleTime = SAMPLE_TIME;
  protected readonly cityOptions = CITY_OPTIONS;

  protected readonly switchValue = signal(1);
  protected readonly switching = signal(false);
  protected readonly dateRange = signal<DateRangeValue>([]);
  protected readonly selectorValue = signal<string | number | null>(null);
  protected readonly score = signal(88);
  protected readonly title = signal('可编辑标题');

  protected async onSwitch(next: StateValue) {
    this.switching.set(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      this.switchValue.set(Number(next));
      this.message.success('状态已切换');
    } finally {
      this.switching.set(false);
    }
  }

  protected onSelectorChange(value: DoSelectorValue) {
    this.selectorValue.set(Array.isArray(value) ? (value[0] ?? null) : value);
  }

  protected readonly onScoreOk = (value: number) => {
    this.score.set(value);
    this.message.success(`评分更新为 ${value}`);
  };

  protected readonly onTitleOk = (value: string) => {
    this.title.set(value);
    this.message.success('标题已更新');
  };
}
