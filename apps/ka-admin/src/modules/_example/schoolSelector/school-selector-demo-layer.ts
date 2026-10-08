import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';

import {
  DialogEditSchoolSelectorDemo,
  type SchoolSelectorDemoForm,
} from './_module/dialog-edit-school-selector-demo';

import { DoFilterPanel } from '@/components/do-filter-panel';
import { SchoolSelector } from '@/modules/_example/schoolResource/_module/school-selector';
import type {
  SchoolSelectorChange,
  SchoolSelectorValue,
} from '@/modules/_example/schoolResource/_module/types';

function formatMultiLabels(list: SchoolSelectorValue[]) {
  return list.map((item) => item.label).join('、');
}

@Component({
  selector: 'ka-school-selector-demo-layer',
  imports: [
    DialogEditSchoolSelectorDemo,
    DoFilterPanel,
    FormsModule,
    NzButtonModule,
    SchoolSelector,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-example-school-selector-demo' },
  template: `
    <section class="page-example-school-selector-demo-card">
      <h3 class="page-example-school-selector-demo-section">筛选区（单选 / 多选）</h3>
      <ka-do-filter-panel
        [line]="1"
        (searchClick)="handleFilterSearch()"
      >
        <div class="do-filter-field">
          <span class="do-filter-field-label do-filter-field-label-wide">学校（单选）</span>
          <ka-school-selector
            placeholder="请选择学校"
            [ngModel]="schoolSingle()"
            (ngModelChange)="onSingleChange($event)"
          />
        </div>
        <div class="do-filter-field">
          <span class="do-filter-field-label do-filter-field-label-wide">学校（多选）</span>
          <ka-school-selector
            placeholder="请选择学校（可多选）"
            [multiple]="true"
            [defaultPageSize]="5"
            [ngModel]="schoolMulti()"
            (ngModelChange)="onMultiChange($event)"
          />
        </div>
        <button
          filterCtl
          nz-button
          (click)="handleFilterReset()"
        >
          重置
        </button>
      </ka-do-filter-panel>
      <p class="page-example-school-selector-demo-meta">
        当前值：单选={{ schoolSingle()?.label || '—' }}；多选={{ multiLabels() || '—' }}
      </p>
      @if (lastFilterSnapshot()) {
        <p class="page-example-school-selector-demo-meta">
          上次查询快照：{{ lastFilterSnapshot() }}
        </p>
      }
    </section>

    <section class="page-example-school-selector-demo-card">
      <h3 class="page-example-school-selector-demo-section">弹层表单回填</h3>
      <div class="page-example-school-selector-demo-actions">
        <button
          nz-button
          nzType="primary"
          (click)="openCreateDemo()"
        >
          新建演示
        </button>
        <button
          nz-button
          (click)="openEditDemo()"
        >
          编辑演示
        </button>
      </div>
      @if (lastDialogSnapshot()) {
        <p class="page-example-school-selector-demo-meta">
          上次弹层提交：{{ lastDialogSnapshot() }}
        </p>
      }
    </section>

    <ka-dialog-edit-school-selector-demo
      [open]="editOpen()"
      [seed]="editSeed()"
      (closed)="editOpen.set(false)"
      (success)="onDialogSuccess($event)"
    />
  `,
})
export default class SchoolSelectorDemoLayer {
  protected readonly schoolSingle = signal<SchoolSelectorValue | null>(null);
  protected readonly schoolMulti = signal<SchoolSelectorValue[]>([]);
  protected readonly lastFilterSnapshot = signal('');
  protected readonly lastDialogSnapshot = signal('');
  protected readonly editOpen = signal(false);
  protected readonly editSeed = signal<SchoolSelectorDemoForm | null>(null);

  protected multiLabels() {
    return formatMultiLabels(this.schoolMulti());
  }

  protected onSingleChange(value: SchoolSelectorChange | null) {
    this.schoolSingle.set(value && !Array.isArray(value) ? value : null);
  }

  protected onMultiChange(value: SchoolSelectorChange | null) {
    this.schoolMulti.set(Array.isArray(value) ? value : []);
  }

  protected handleFilterSearch() {
    this.lastFilterSnapshot.set(
      JSON.stringify({
        single: this.schoolSingle()?.id ?? null,
        multi: this.schoolMulti().map((item) => item.id),
      }),
    );
  }

  protected handleFilterReset() {
    this.schoolSingle.set(null);
    this.schoolMulti.set([]);
    this.lastFilterSnapshot.set('');
  }

  protected openCreateDemo() {
    this.editSeed.set(null);
    this.editOpen.set(true);
  }

  protected openEditDemo() {
    this.editSeed.set({
      id: 'demo-1',
      demoName: '演示班级计划',
      schoolSingle: this.schoolSingle(),
      schoolMulti: [...this.schoolMulti()],
    });
    this.editOpen.set(true);
  }

  protected onDialogSuccess(payload: SchoolSelectorDemoForm) {
    this.lastDialogSnapshot.set(
      `${payload.demoName}｜单选=${payload.schoolSingle?.label || '—'}｜多选=${
        formatMultiLabels(payload.schoolMulti) || '—'
      }`,
    );
  }
}
