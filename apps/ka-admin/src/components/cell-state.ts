import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

type StateValue = string | number | boolean;
type StateTone = 'success' | 'warning' | 'danger' | 'info' | 'primary';

/**
 * 状态单元格：可切换时为 Switch+确认；只读时为圆点+文案指示器。
 * 行为对齐 kv3 `CellState.vue`。
 */
@Component({
  selector: 'ka-cell-state',
  imports: [FormsModule, NzIconModule, NzPopconfirmModule, NzSwitchModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'cell-state' },
  template: `
    @if (switchable()) {
      @if (manual()) {
        <nz-switch
          [nzControl]="true"
          [ngModel]="isActive()"
          [nzDisabled]="switching()"
          (click)="emitSwitch()"
        />
      } @else {
        <span
          class="cell-state-switch-wrap"
          nz-popconfirm
          [nzPopconfirmTitle]="confirmTitle()"
          nzOkText="确定"
          nzCancelText="取消"
          [nzCondition]="switching()"
          (nzOnConfirm)="emitSwitch()"
        >
          <nz-switch
            [nzControl]="true"
            [ngModel]="isActive()"
            [nzDisabled]="switching()"
          />
        </span>
      }
      @if (switching()) {
        <nz-icon
          class="cell-state-loading"
          nzType="loading"
          [nzSpin]="true"
        />
      }
    } @else {
      <span
        class="cell-state-indicator"
        [class]="'is-' + (isActive() ? activeType() : inactiveType())"
      >
        {{ isActive() ? activeLabel() : inactiveLabel() }}
      </span>
    }
  `,
})
export class CellState {
  readonly modelValue = input<StateValue | null | undefined>();
  readonly activeValue = input<StateValue>(1);
  readonly inactiveValue = input<StateValue>(0);
  readonly activeLabel = input('启用');
  readonly inactiveLabel = input('禁用');
  readonly activeType = input<StateTone>('success');
  readonly inactiveType = input<StateTone>('info');
  readonly switchable = input(false);
  readonly switching = input(false);
  readonly activeTips = input('确认启用？');
  readonly inactiveTips = input('确认禁用？');
  /** true 时不经确认直接切换（与 kv3 CellState.manual 对齐） */
  readonly manual = input(false);
  readonly switchChange = output<StateValue>();

  protected readonly isActive = computed(() => this.modelValue() === this.activeValue());
  protected readonly confirmTitle = computed(() =>
    this.isActive() ? this.inactiveTips() : this.activeTips(),
  );

  protected emitSwitch() {
    if (this.switching()) return;
    this.switchChange.emit(this.isActive() ? this.inactiveValue() : this.activeValue());
  }
}
