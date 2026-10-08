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
import { SimpleExampleApi, type SimpleExampleRow } from '@/modules/_example/simpleExample/_api';
import { notBlank } from '@/utils/validators';

@Component({
  selector: 'ka-dialog-edit-simple-example',
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
          {{ isEdit() ? '修改' : '添加' }}示例
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
              nzFor="pkg"
            >
              产品包名
            </nz-form-label>
            <nz-form-control nzErrorTip="请输入产品包名">
              <nz-input-wrapper nzAllowClear>
                <input
                  id="pkg"
                  nz-input
                  formControlName="pkg"
                  placeholder="请输入产品包名"
                />
              </nz-input-wrapper>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label
              nzFlex="100px"
              nzRequired
              nzFor="exampleName"
            >
              示例名称
            </nz-form-label>
            <nz-form-control nzErrorTip="请输入示例名称">
              <nz-input-wrapper nzAllowClear>
                <input
                  id="exampleName"
                  nz-input
                  formControlName="exampleName"
                  placeholder="请输入示例名称"
                />
              </nz-input-wrapper>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label nzFlex="100px">状态</nz-form-label>
            <nz-form-control>
              <nz-radio-group formControlName="status">
                @for (option of statusOptions; track option.value) {
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
        </form>
      </ng-container>
    </nz-modal>
  `,
})
export class DialogEditSimpleExample {
  readonly open = input(false);
  readonly row = input<SimpleExampleRow | null>(null);
  readonly closed = output<void>();
  readonly success = output<void>();

  private readonly api = inject(SimpleExampleApi);
  private readonly message = inject(NzMessageService);
  protected readonly statusOptions = maps.example.simpleExample.exampleStatus.options;
  protected readonly loading = signal(false);
  protected readonly isEdit = computed(() => !!this.row()?.id);

  protected readonly form = inject(NonNullableFormBuilder).group({
    pkg: ['', notBlank],
    exampleName: ['', notBlank],
    status: [maps.example.simpleExample.exampleStatus.EXAMPLE_STATUS_ENABLED as number],
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const row = this.row();
      untracked(() =>
        this.form.reset({
          pkg: row?.pkg || '',
          exampleName: row?.exampleName || '',
          status: row?.status ?? maps.example.simpleExample.exampleStatus.EXAMPLE_STATUS_ENABLED,
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
      await this.api.requestEditSimpleExample({
        id: this.row()?.id || undefined,
        exampleName: values.exampleName.trim(),
        status: values.status,
      });
      this.message.success(this.isEdit() ? '修改成功' : '创建成功');
      this.closed.emit();
      this.success.emit();
    } finally {
      this.loading.set(false);
    }
  }
}
