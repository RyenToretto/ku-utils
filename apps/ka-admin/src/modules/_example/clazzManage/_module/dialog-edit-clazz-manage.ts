import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';

import maps from '@/maps';
import { ClazzManageApi, type ClazzManageRow } from '@/modules/_example/clazzManage/_api';
import { SchoolSelector } from '@/modules/_example/schoolResource/_module/school-selector';
import {
  toSchoolPickFromRef,
  type SchoolSelectorValue,
} from '@/modules/_example/schoolResource/_module/types';
import { notBlank, requiredPick } from '@/utils/validators';

@Component({
  selector: 'ka-dialog-edit-clazz-manage',
  imports: [
    NzFormModule,
    NzInputModule,
    NzModalModule,
    NzRadioModule,
    ReactiveFormsModule,
    SchoolSelector,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-modal
      [nzVisible]="open()"
      [nzTitle]="titleTpl"
      [nzWidth]="560"
      nzOkText="确 定"
      nzCancelText="取 消"
      [nzOkLoading]="loading()"
      (nzOnCancel)="closed.emit()"
      (nzOnOk)="handleOk()"
    >
      <ng-template #titleTpl>
        <span>
          {{ isEdit() ? '修改' : '添加' }}班级
          @if (isEdit()) {
            <span class="dialog-tips">(ID: {{ row()?.id }})</span>
          }
        </span>
      </ng-template>
      <ng-container *nzModalContent>
        <form
          nz-form
          class="do-dialog-content-box"
          [formGroup]="form"
          (ngSubmit)="handleOk()"
        >
          <nz-form-item>
            <nz-form-label
              nzFlex="100px"
              nzRequired
              nzFor="clazzName"
            >
              班级名称
            </nz-form-label>
            <nz-form-control nzErrorTip="请输入班级名称">
              <nz-input-wrapper nzAllowClear>
                <input
                  id="clazzName"
                  nz-input
                  formControlName="clazzName"
                  placeholder="请输入班级名称"
                />
              </nz-input-wrapper>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label nzFlex="100px">状态</nz-form-label>
            <nz-form-control>
              <nz-radio-group formControlName="status">
                @for (option of statusMap.options; track option.value) {
                  <label
                    nz-radio
                    [nzValue]="option.value"
                  >
                    {{ option.label }}
                  </label>
                }
              </nz-radio-group>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label
              nzFlex="100px"
              nzRequired
            >
              所属学校
            </nz-form-label>
            <nz-form-control nzErrorTip="请选择所属学校">
              <ka-school-selector formControlName="schoolPick" />
            </nz-form-control>
          </nz-form-item>
        </form>
      </ng-container>
    </nz-modal>
  `,
})
export class DialogEditClazzManage {
  readonly open = input(false);
  readonly row = input<ClazzManageRow | null>(null);
  readonly closed = output<void>();
  readonly success = output<void>();

  private readonly api = inject(ClazzManageApi);
  private readonly message = inject(NzMessageService);
  protected readonly statusMap = maps.example.clazzManage.clazzStatus;
  protected readonly loading = signal(false);
  protected readonly isEdit = computed(() => !!this.row()?.id);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    clazzName: ['', notBlank],
    status: [this.statusMap.CLAZZ_STATUS_ENABLED as number],
    schoolPick: [null as SchoolSelectorValue | null, requiredPick],
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const row = this.row();
      untracked(() =>
        this.form.reset({
          clazzName: row?.clazzName || '',
          status: row?.status ?? this.statusMap.CLAZZ_STATUS_ENABLED,
          schoolPick:
            row?.schoolId != null
              ? toSchoolPickFromRef({ id: row.schoolId, schoolName: row.schoolName })
              : null,
        }),
      );
    });
  }

  protected async handleOk() {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }
    const values = this.form.getRawValue();
    this.loading.set(true);
    try {
      await this.api.requestEditClazzManage({
        id: this.row()?.id || undefined,
        clazzName: values.clazzName.trim(),
        status: values.status,
        schoolId: values.schoolPick?.id ?? null,
        schoolName: values.schoolPick?.item.schoolName || values.schoolPick?.label || '',
      });
      this.message.success(this.isEdit() ? '修改成功' : '创建成功');
      this.closed.emit();
      this.success.emit();
    } finally {
      this.loading.set(false);
    }
  }
}
