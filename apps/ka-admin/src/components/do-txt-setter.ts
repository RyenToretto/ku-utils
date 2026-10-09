import { NgTemplateOutlet } from '@angular/common';
import type { ElementRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';
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
            #txtInput
            nz-input
            [nzStatus]="error() ? 'error' : ''"
            [placeholder]="placeholder()"
            [ngModel]="draft()"
            (ngModelChange)="onDraftChange($event)"
            (keydown.enter)="submit()"
          />
        </nz-input-wrapper>
        @if (error()) {
          <div class="do-txtsetter-error">{{ error() }}</div>
        }
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
  readonly required = input(true);
  readonly placeholder = input('请输入');
  readonly inline = input(false);
  readonly disabled = input(false);
  readonly changing = input(false);
  readonly ok = input<(value: string) => void | Promise<void>>();

  protected readonly open = signal(false);
  protected readonly draft = signal('');
  protected readonly error = signal('');
  private readonly txtInput = viewChild<ElementRef<HTMLInputElement>>('txtInput');

  constructor() {
    effect(() => this.txtInput()?.nativeElement.focus());
  }

  protected onOpenChange(visible: boolean) {
    if (visible && this.changing()) return;
    this.open.set(visible);
    if (visible) {
      this.draft.set(this.initValue());
      this.error.set('');
    }
  }

  protected onDraftChange(value: string | null) {
    this.draft.set(value ?? '');
    if (value) this.error.set('');
  }

  protected submit() {
    const value = this.draft();
    if (this.required() && !value) {
      this.error.set(this.placeholder());
      return;
    }
    if (this.changing()) return;
    this.open.set(false);
    if (value !== this.initValue()) void this.ok()?.(value);
  }
}
