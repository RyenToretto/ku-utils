import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { THEME_OPTIONS, type ThemeMode } from '@/utils/theme';

const DEFAULT_LABELS: Record<ThemeMode, string> = {
  light: '浅色',
  dark: '深色',
  system: '跟随系统',
};

@Component({
  selector: 'ka-appearance-picker',
  imports: [NzIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="appearance-options">
      @for (opt of options; track opt.value) {
        <button
          type="button"
          class="appearance-option"
          [class.is-active]="value() === opt.value"
          (pointerdown)="pick($event, opt.value)"
        >
          <span>{{ labels()[opt.value] }}</span>
          @if (value() === opt.value) {
            <nz-icon nzType="check" />
          }
        </button>
      }
    </div>
  `,
})
export class AppearancePicker {
  readonly value = input.required<ThemeMode>();
  readonly labelOverrides = input<Partial<Record<ThemeMode, string>>>({});
  readonly valueChange = output<ThemeMode>();

  protected readonly options = THEME_OPTIONS;
  protected readonly labels = computed(() => ({ ...DEFAULT_LABELS, ...this.labelOverrides() }));

  /** pointerdown 即切肤：账户浮层在外部点击判定前就能拿到选择（对齐 kr） */
  protected pick(event: PointerEvent, mode: ThemeMode) {
    if (event.button !== 0) return;
    event.preventDefault();
    this.valueChange.emit(mode);
  }
}
