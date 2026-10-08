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
import { ClubActivityApi, type ClubActivityRow } from '@/modules/_example/clubActivity/_api';
import { SchoolSelector } from '@/modules/_example/schoolResource/_module/school-selector';
import {
  toSchoolPickFromRef,
  type SchoolSelectorValue,
} from '@/modules/_example/schoolResource/_module/types';
import { notBlank, requiredPick } from '@/utils/validators';

@Component({
  selector: 'ka-dialog-edit-club-activity',
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
      [nzTitle]="isEdit() ? '编辑社团活动' : '新建社团活动'"
      [nzWidth]="560"
      [nzMaskClosable]="false"
      [nzOkLoading]="loading()"
      (nzOnCancel)="closed.emit()"
      (nzOnOk)="handleOk()"
    >
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
              nzFor="clubName"
            >
              活动名称
            </nz-form-label>
            <nz-form-control nzErrorTip="请输入活动名称">
              <nz-input-wrapper nzAllowClear>
                <input
                  id="clubName"
                  nz-input
                  maxlength="60"
                  formControlName="clubName"
                  placeholder="请输入活动名称"
                />
              </nz-input-wrapper>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label
              nzFlex="100px"
              nzRequired
            >
              状态
            </nz-form-label>
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
              <span class="dialog-tips">仅启用状态可被业务引用</span>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label
              nzFlex="100px"
              nzRequired
            >
              关联学校
            </nz-form-label>
            <nz-form-control nzErrorTip="请至少选择一所学校">
              <ka-school-selector
                formControlName="schoolPick"
                [multiple]="true"
              />
            </nz-form-control>
          </nz-form-item>
        </form>
      </ng-container>
    </nz-modal>
  `,
})
export class DialogEditClubActivity {
  readonly open = input(false);
  readonly row = input<ClubActivityRow | null>(null);
  readonly closed = output<void>();
  readonly success = output<void>();

  private readonly api = inject(ClubActivityApi);
  private readonly message = inject(NzMessageService);
  protected readonly statusMap = maps.example.clubActivity.clubStatus;
  protected readonly loading = signal(false);
  protected readonly isEdit = computed(() => !!this.row()?.id);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    clubName: ['', notBlank],
    status: [this.statusMap.CLUB_STATUS_ENABLED as number],
    schoolPick: [[] as SchoolSelectorValue[], requiredPick],
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const row = this.row();
      untracked(() =>
        this.form.reset({
          clubName: row?.clubName || '',
          status: row?.status ?? this.statusMap.CLUB_STATUS_ENABLED,
          schoolPick: (row?.schools || []).map(toSchoolPickFromRef),
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
      await this.api.requestEditClubActivity({
        id: this.row()?.id || undefined,
        clubName: values.clubName.trim(),
        status: values.status,
        schools: values.schoolPick.map((pick) => ({
          id: pick.id,
          schoolName: pick.item.schoolName || pick.label,
        })),
      });
      this.message.success(this.isEdit() ? '修改成功' : '创建成功');
      this.closed.emit();
      this.success.emit();
    } finally {
      this.loading.set(false);
    }
  }
}
