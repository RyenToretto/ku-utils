import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';

import { SchoolResourceList } from './school-resource-list';

import type { SchoolResourceRow } from '@/modules/_example/schoolResource/_api';

/** 学校选择抽屉，对齐 kv3 `DialogSelectSchoolResource.vue` / kr `DialogSelectSchoolResource` */
@Component({
  selector: 'ka-dialog-select-school-resource',
  imports: [NzButtonModule, NzDrawerModule, SchoolResourceList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-drawer
      nzTitle="选择学校"
      nzWrapClassName="drawer-model-selector"
      [nzVisible]="open()"
      [nzWidth]="960"
      [nzMaskClosable]="false"
      [nzKeyboard]="false"
      [nzFooter]="footerTpl"
      (nzOnClose)="cancelled.emit()"
    >
      <div
        *nzDrawerContent
        class="do-drawer__view"
      >
        <ka-school-resource-list
          [enableSelector]="true"
          [inDialog]="true"
          [isMultiple]="isMultiple()"
          [checkedRows]="checkedRows()"
          [lockEnabledStatus]="lockEnabledStatus()"
          [defaultPageSize]="pageSize()"
          (selectionChange)="onSelectionChange($event)"
        />
      </div>
      <ng-template #footerTpl>
        <div class="do-drawer__foot_btn">
          @if (isMultiple()) {
            <span class="selected-count">已选 {{ picked().length }} 所</span>
          }
          <button
            nz-button
            (click)="cancelled.emit()"
          >
            取 消
          </button>
          <button
            nz-button
            nzType="primary"
            (click)="confirm()"
          >
            确 定
          </button>
        </div>
      </ng-template>
    </nz-drawer>
  `,
})
export class DialogSelectSchoolResource {
  readonly open = input(false);
  readonly isMultiple = input(false);
  readonly lockEnabledStatus = input(true);
  /** 打开时回显的已选行 */
  readonly checkedRows = input<SchoolResourceRow[]>([]);
  readonly defaultPageSize = input<number>();
  readonly cancelled = output<void>();
  readonly confirmed = output<SchoolResourceRow | SchoolResourceRow[] | undefined>();

  protected readonly picked = signal<SchoolResourceRow[]>([]);
  protected readonly pageSize = computed(
    () => this.defaultPageSize() ?? (this.isMultiple() ? 5 : 10),
  );

  constructor() {
    // 仅在打开瞬间快照已选，抽屉内的勾选不回写外部
    effect(() => {
      if (this.open()) untracked(() => this.picked.set(this.checkedRows()));
    });
  }

  protected onSelectionChange(value: SchoolResourceRow | SchoolResourceRow[] | undefined) {
    const list = Array.isArray(value) ? value : value ? [value] : [];
    this.picked.set(this.isMultiple() ? list : list.slice(0, 1));
  }

  protected confirm() {
    const picked = this.picked();
    this.confirmed.emit(this.isMultiple() ? picked : picked[0]);
  }
}
