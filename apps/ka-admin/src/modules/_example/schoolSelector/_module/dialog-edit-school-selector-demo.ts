import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  untracked,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  type AbstractControl,
  type ValidationErrors,
} from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { SchoolSelector } from '@/modules/_example/schoolResource/_module/school-selector';
import type { SchoolSelectorValue } from '@/modules/_example/schoolResource/_module/types';
import { notBlank } from '@/utils/validators';

export type SchoolSelectorDemoForm = {
  id: string;
  demoName: string;
  schoolSingle: SchoolSelectorValue | null;
  schoolMulti: SchoolSelectorValue[];
};

function requiredPick(control: AbstractControl): ValidationErrors | null {
  return control.value ? null : { required: true };
}

@Component({
  selector: 'ka-dialog-edit-school-selector-demo',
  imports: [NzFormModule, NzInputModule, NzModalModule, ReactiveFormsModule, SchoolSelector],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-modal
      [nzVisible]="open()"
      [nzTitle]="titleTpl"
      [nzWidth]="640"
      nzOkText="确 定"
      nzCancelText="取 消"
      (nzOnCancel)="closed.emit()"
      (nzOnOk)="handleOk()"
    >
      <ng-template #titleTpl>
        <span>
          {{ isEdit() ? '编辑演示' : '新建演示' }}
          @if (isEdit()) {
            <span class="dialog-edit-school-selector-demo-tips">（验证选择器回填）</span>
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
              nzFlex="120px"
              nzRequired
              nzFor="demoName"
            >
              演示名称
            </nz-form-label>
            <nz-form-control nzErrorTip="请输入演示名称">
              <nz-input-wrapper nzAllowClear>
                <input
                  id="demoName"
                  nz-input
                  formControlName="demoName"
                  placeholder="请输入演示名称"
                />
              </nz-input-wrapper>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label
              nzFlex="120px"
              nzRequired
            >
              学校（单选）
            </nz-form-label>
            <nz-form-control nzErrorTip="请选择学校">
              <ka-school-selector formControlName="schoolSingle" />
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label nzFlex="120px">学校（多选）</nz-form-label>
            <nz-form-control>
              <ka-school-selector
                formControlName="schoolMulti"
                [multiple]="true"
              />
            </nz-form-control>
          </nz-form-item>
        </form>
      </ng-container>
    </nz-modal>
  `,
})
export class DialogEditSchoolSelectorDemo {
  readonly open = input(false);
  readonly seed = input<Partial<SchoolSelectorDemoForm> | null>(null);
  readonly closed = output<void>();
  readonly success = output<SchoolSelectorDemoForm>();

  private readonly message = inject(NzMessageService);
  protected readonly isEdit = computed(() => !!this.seed()?.id);

  protected readonly form = inject(FormBuilder).group({
    demoName: ['', notBlank],
    schoolSingle: [null as SchoolSelectorValue | null, requiredPick],
    schoolMulti: [[] as SchoolSelectorValue[]],
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const seed = this.seed();
      untracked(() =>
        this.form.reset({
          demoName: seed?.demoName ?? '',
          schoolSingle: seed?.schoolSingle ?? null,
          schoolMulti: seed?.schoolMulti ? [...seed.schoolMulti] : [],
        }),
      );
    });
  }

  protected handleOk() {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }
    const values = this.form.getRawValue();
    this.success.emit({
      id: this.seed()?.id || '',
      demoName: (values.demoName ?? '').trim(),
      schoolSingle: values.schoolSingle ?? null,
      schoolMulti: [...(values.schoolMulti ?? [])],
    });
    this.message.success(this.isEdit() ? '编辑演示已确认' : '新建演示已确认');
    this.closed.emit();
  }
}
