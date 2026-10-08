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
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';

import maps from '@/maps';
import { SchoolResourceApi, type SchoolResourceRow } from '@/modules/_example/schoolResource/_api';
import { notBlank } from '@/utils/validators';

@Component({
  selector: 'ka-dialog-edit-school-resource',
  imports: [NzFormModule, NzInputModule, NzModalModule, NzRadioModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-modal
      [nzVisible]="open()"
      [nzTitle]="titleTpl"
      [nzWidth]="520"
      nzOkText="确 定"
      nzCancelText="取 消"
      [nzOkLoading]="loading()"
      (nzOnCancel)="closed.emit()"
      (nzOnOk)="handleOk()"
    >
      <ng-template #titleTpl>
        <span>
          {{ isEdit() ? '修改' : '添加' }}学校
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
              nzFor="schoolName"
            >
              学校名称
            </nz-form-label>
            <nz-form-control nzErrorTip="请输入学校名称">
              <nz-input-wrapper nzAllowClear>
                <input
                  id="schoolName"
                  nz-input
                  formControlName="schoolName"
                  placeholder="请输入学校名称"
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
              nzFor="remark"
            >
              备注
            </nz-form-label>
            <nz-form-control>
              <nz-input-wrapper nzAllowClear>
                <textarea
                  id="remark"
                  nz-input
                  rows="3"
                  formControlName="remark"
                  placeholder="选填"
                ></textarea>
              </nz-input-wrapper>
            </nz-form-control>
          </nz-form-item>
        </form>
      </ng-container>
    </nz-modal>
  `,
})
export class DialogEditSchoolResource {
  readonly open = input(false);
  readonly row = input<SchoolResourceRow | null>(null);
  readonly closed = output<void>();
  readonly success = output<void>();

  private readonly api = inject(SchoolResourceApi);
  private readonly message = inject(NzMessageService);
  protected readonly statusMap = maps.example.schoolResource.schoolStatus;
  protected readonly loading = signal(false);
  protected readonly isEdit = computed(() => !!this.row()?.id);

  protected readonly form = inject(NonNullableFormBuilder).group({
    schoolName: ['', notBlank],
    status: [this.statusMap.SCHOOL_STATUS_ENABLED as number],
    remark: [''],
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const row = this.row();
      untracked(() =>
        this.form.reset({
          schoolName: row?.schoolName || '',
          status: row?.status ?? this.statusMap.SCHOOL_STATUS_ENABLED,
          remark: row?.remark || '',
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
      await this.api.requestEditSchoolResource({
        id: this.row()?.id || undefined,
        schoolName: values.schoolName.trim(),
        status: values.status,
        remark: values.remark.trim(),
      });
      this.message.success(this.isEdit() ? '修改成功' : '创建成功');
      this.closed.emit();
      this.success.emit();
    } finally {
      this.loading.set(false);
    }
  }
}
