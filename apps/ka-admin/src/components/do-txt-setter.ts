import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopoverModule } from 'ng-zorro-antd/popover';

/** 行内文本编辑器，对齐 kv3 `DoTxtSetter.vue`；展示内容走默认投影。 */
@Component({
  selector: 'ka-do-txt-setter',
  imports: [
    NgTemplateOutlet,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzPopoverModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'do-txt-setter',
    '[class.inline]': 'inline()',
  },
  template: `
    <ng-template #content><ng-content /></ng-template>
    @if (disabled()) {
      <ng-container [ngTemplateOutlet]="content" />
    } @else {
      <div
        class="txt-set-btn"
        [class.changing]="changing()"
        nz-popover
        nzPopoverTrigger="click"
        nzPopoverPlacement="bottomLeft"
        [nzPopoverContent]="panel"
        [nzPopoverVisible]="open()"
        (nzPopoverVisibleChange)="onOpenChange($event)"
      >
        @if (changing()) {
          <nz-icon
            nzType="loading"
            [nzSpin]="true"
          />
        } @else {
          <ng-container [ngTemplateOutlet]="content" />
        }
      </div>
    }
    <ng-template #panel>
      <div class="do-txtsetter-popover">
        <nz-input-wrapper nzAllowClear>
          <input
            nz-input
            [ngModel]="draft()"
            (ngModelChange)="draft.set($event ?? '')"
            (keydown.enter)="submit()"
          />
        </nz-input-wrapper>
        <div class="do-txtsetter-footer">
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
export class DoTxtSetter {
  readonly initValue = input('');
  readonly inline = input(false);
  readonly disabled = input(false);
  readonly changing = input(false);
  readonly ok = input<(value: string) => void | Promise<void>>();

  protected readonly open = signal(false);
  protected readonly draft = signal('');

  protected onOpenChange(visible: boolean) {
    this.open.set(visible);
    if (visible) this.draft.set(this.initValue());
  }

  protected async submit() {
    await this.ok()?.(this.draft());
    this.open.set(false);
  }
}
