import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {
  ControlContainer,
  FormsModule,
  NG_VALUE_ACCESSOR,
  type ControlValueAccessor,
} from '@angular/forms';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSelectModule, type NzSelectComponent } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { DialogSelectSchoolResource } from './dialog-select-school-resource';
import { toSchoolPick, type SchoolSelectorChange, type SchoolSelectorValue } from './types';

import type { SchoolResourceRow } from '@/modules/_example/schoolResource/_api';

/**
 * 学校选择器：点击打开抽屉选择；多选折叠为 1 个 tag，悬浮展开全部。
 * 表单控件（`formControlName` / `ngModel`），值为 `SchoolSelectorValue | SchoolSelectorValue[] | null`。
 * 对齐 kv3 `SchoolSelector.vue` / kr `SchoolSelector`。
 */
@Component({
  selector: 'ka-school-selector',
  imports: [DialogSelectSchoolResource, FormsModule, NzPopoverModule, NzSelectModule, NzTagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SchoolSelector), multi: true },
  ],
  // 自身即表单控件：内部下拉与抽屉列表的 ngModel 不归属外层表单
  viewProviders: [{ provide: ControlContainer, useValue: null }],
  host: {
    class: 'school-selector',
    '[class.is-multiple]': 'multiple()',
  },
  template: `
    <nz-select
      #select
      class="school-selector-trigger"
      nz-popover
      nzPopoverPlacement="topLeft"
      nzPopoverOverlayClassName="do-selector-tags-popover"
      [nzPopoverTrigger]="showTagsPopover() ? 'hover' : null"
      [nzPopoverMouseEnterDelay]="0.3"
      [nzPopoverMouseLeaveDelay]="0.14"
      [nzPopoverContent]="tagsTpl"
      [nzMode]="multiple() ? 'multiple' : 'default'"
      [nzAllowClear]="clearable()"
      [nzDisabled]="isDisabled()"
      [nzPlaceHolder]="placeholder()"
      [nzMaxTagCount]="maxTagCount()"
      [nzMaxTagPlaceholder]="omittedTpl"
      [nzShowArrow]="true"
      [ngModel]="selectValue()"
      (ngModelChange)="onSelectChange($event)"
      (nzOpenChange)="onOpenChange($event)"
      (nzBlur)="onTouched()"
    >
      @for (item of selected(); track item.id) {
        <nz-option
          [nzValue]="item.id"
          [nzLabel]="item.label"
        />
      }
    </nz-select>
    <ng-template
      #omittedTpl
      let-omitted
    >
      + {{ omitted.length }}
    </ng-template>
    <ng-template #tagsTpl>
      <div class="do-selector-tags-panel">
        @for (item of selected(); track item.id) {
          <nz-tag
            class="do-selector-tag"
            nzMode="closeable"
            (nzOnClose)="$event.preventDefault(); removeById(item.id)"
          >
            {{ item.label }}
          </nz-tag>
        }
      </div>
    </ng-template>

    <ka-dialog-select-school-resource
      [open]="pickerOpen()"
      [isMultiple]="multiple()"
      [lockEnabledStatus]="lockEnabledStatus()"
      [checkedRows]="checkedRows()"
      [defaultPageSize]="defaultPageSize()"
      (cancelled)="pickerOpen.set(false)"
      (confirmed)="onConfirm($event)"
    />
  `,
})
export class SchoolSelector implements ControlValueAccessor {
  readonly multiple = input(false);
  readonly clearable = input(true);
  readonly disabled = input(false);
  readonly lockEnabledStatus = input(true);
  readonly placeholder = input('请选择学校');
  /** 选择器抽屉内默认分页大小（缺省：多选 5 / 单选 10） */
  readonly defaultPageSize = input<number>();

  private readonly select = viewChild.required<NzSelectComponent>('select');
  private readonly value = signal<SchoolSelectorChange | null>(null);
  private readonly formDisabled = signal(false);
  protected readonly pickerOpen = signal(false);

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly selected = computed<SchoolSelectorValue[]>(() => {
    const value = this.value();
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  });
  protected readonly selectValue = computed(() =>
    this.multiple() ? this.selected().map((item) => item.id) : (this.selected()[0]?.id ?? null),
  );
  protected readonly maxTagCount = computed(() => (this.multiple() ? 1 : Infinity));
  protected readonly checkedRows = computed(() => this.selected().map((item) => item.item));
  protected readonly showTagsPopover = computed(
    () => this.multiple() && !this.isDisabled() && this.selected().length > 0,
  );

  private onChange: (value: SchoolSelectorChange | null) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: SchoolSelectorChange | null | undefined) {
    this.value.set(value ?? (this.multiple() ? [] : null));
  }

  registerOnChange(fn: (value: SchoolSelectorChange | null) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean) {
    this.formDisabled.set(disabled);
  }

  private emit(next: SchoolSelectorChange | null) {
    this.value.set(next);
    this.onChange(next);
  }

  /** 下拉不展开，改为打开选择抽屉 */
  protected onOpenChange(visible: boolean) {
    if (!visible) return;
    this.select().setOpenState(false);
    if (!this.isDisabled()) this.pickerOpen.set(true);
  }

  /** 仅承接清空 / 多选删 tag；选择走抽屉 */
  protected onSelectChange(next: string | string[] | null) {
    if (this.multiple()) {
      const ids = Array.isArray(next) ? next : [];
      this.emit(this.selected().filter((item) => ids.includes(item.id)));
      return;
    }
    if (next == null) this.emit(null);
  }

  protected removeById(id: string) {
    this.emit(this.selected().filter((item) => item.id !== id));
  }

  protected onConfirm(rows: SchoolResourceRow | SchoolResourceRow[] | undefined) {
    if (this.multiple()) {
      const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
      this.emit(list.map(toSchoolPick));
    } else {
      const row = Array.isArray(rows) ? rows[0] : rows;
      this.emit(row ? toSchoolPick(row) : null);
    }
    this.pickerOpen.set(false);
  }
}
