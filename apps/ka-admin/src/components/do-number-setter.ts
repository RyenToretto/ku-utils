import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import type { NzInputNumberComponent } from 'ng-zorro-antd/input-number';
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
        [class.is-changing]="changing()"
        [class.is-active]="open()"
        nz-popover
        nzPopoverTrigger="click"
        nzPopoverPlacement="bottomRight"
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
        @if (label()) {
          <div class="do-number-setter-title">{{ label() }}</div>
        }
        <nz-input-number
          #numberInput
          class="do-number-setter-input"
          [nzMin]="minNum()"
          [nzPlaceHolder]="resolvedPlaceholder()"
          [nzStatus]="error() ? 'error' : ''"
          [ngModel]="draft()"
          (ngModelChange)="onDraftChange($event)"
          (keydown.enter)="submit()"
        />
        @if (error()) {
          <div class="do-number-setter-error">{{ error() }}</div>
        }
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
  readonly label = input('');
  readonly placeholder = input<string>();
  readonly disabled = input(false);
  readonly changing = input(false);
  readonly ok = input<(value: number) => void | Promise<void>>();

  protected readonly open = signal(false);
  protected readonly draft = signal<number | null>(null);
  protected readonly error = signal('');
  protected readonly resolvedPlaceholder = computed(
    () => this.placeholder() ?? `请输入${this.label()}`,
  );
  private readonly numberInput = viewChild<NzInputNumberComponent>('numberInput');

  constructor() {
    effect(() => this.numberInput()?.focus());
  }

  protected onOpenChange(visible: boolean) {
    if (visible && this.changing()) return;
    this.open.set(visible);
    if (visible) {
      this.draft.set(this.newValue() ?? this.num());
      this.error.set('');
    }
  }

  protected onDraftChange(value: number | null) {
    this.draft.set(value);
    if (value !== null) this.error.set('');
  }

  protected submit() {
    const value = this.draft();
    if (value === null) {
      this.error.set(this.resolvedPlaceholder());
      return;
    }
    if (this.changing()) return;
    this.open.set(false);
    if (value !== this.num()) void this.ok()?.(value);
  }
}
