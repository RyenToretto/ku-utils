import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzPopoverModule } from 'ng-zorro-antd/popover';

/** 行内数字编辑器，对齐 kv3 `DoNumberSetter.vue`；标签内容走默认投影。 */
@Component({
  selector: 'ka-do-number-setter',
  imports: [FormsModule, NzButtonModule, NzIconModule, NzInputNumberModule, NzPopoverModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'do-number-setter' },
  template: `
    <span class="do-number-setter-label"><ng-content /></span>
    @if (!disabled()) {
      <span
        class="do-number-setter-control"
        nz-popover
        nzPopoverTrigger="click"
        nzPopoverPlacement="rightBottom"
        [nzPopoverContent]="panel"
        [nzPopoverVisible]="open()"
        (nzPopoverVisibleChange)="onOpenChange($event)"
      >
        <nz-icon
          [nzType]="changing() ? 'loading' : 'edit'"
          [nzSpin]="changing()"
        />
      </span>
    }
    <ng-template #panel>
      <div class="do-number-setter-popover">
        <div class="do-number-setter-form">
          <span style="margin-right: 8px">{{ label() }}</span>
          <nz-input-number
            [nzMin]="minNum()"
            [ngModel]="draft()"
            (ngModelChange)="draft.set(+($event ?? minNum()))"
          />
        </div>
        <div class="do-number-setter-footer">
          <button
            nz-button
            nzSize="small"
            (click)="open.set(false)"
          >
            取消
          </button>
          <button
            nz-button
            nzType="primary"
            nzSize="small"
            (click)="submit()"
          >
            确定
          </button>
        </div>
      </div>
    </ng-template>
  `,
})
export class DoNumberSetter {
  readonly num = input(0);
  readonly newValue = input<number>();
  readonly minNum = input(0);
  readonly label = input('数值');
  readonly disabled = input(false);
  readonly changing = input(false);
  readonly ok = input<(value: number) => void | Promise<void>>();

  protected readonly open = signal(false);
  protected readonly draft = signal(0);

  protected onOpenChange(visible: boolean) {
    this.open.set(visible);
    if (visible) this.draft.set(this.newValue() ?? this.num());
  }

  protected async submit() {
    await this.ok()?.(this.draft());
    this.open.set(false);
  }
}
