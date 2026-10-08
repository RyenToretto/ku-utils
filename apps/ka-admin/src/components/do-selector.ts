import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';

export type DoSelectorOption = {
  value: string | number;
  label: string;
};

export type DoSelectorValue = string | number | Array<string | number> | null;

export type DoSelectorPayload = {
  keyword?: string;
  requestFunc: () => Promise<DoSelectorOption[]>;
};

/** 静态枚举 / 简单远程下拉（不替代分页实体选择器） */
@Component({
  selector: 'ka-do-selector',
  imports: [FormsModule, NzSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-select
      class="do-selector"
      [style.width]="width()"
      [nzAllowClear]="clearable()"
      [nzDisabled]="disabled()"
      [nzMode]="multiple() ? 'multiple' : 'default'"
      [nzPlaceHolder]="placeholder()"
      [nzNotFoundContent]="requesting() ? loadingTpl : undefined"
      [ngModel]="value() ?? (multiple() ? [] : null)"
      (ngModelChange)="onChange($event)"
      (nzOpenChange)="$event && fetchOptions()"
    >
      @if (!requesting()) {
        @for (option of resolved(); track option.value) {
          <nz-option
            [nzValue]="option.value"
            [nzLabel]="option.label"
          />
        }
      }
    </nz-select>
    <ng-template #loadingTpl>
      <span class="do-selector-loading">加载中...</span>
    </ng-template>
  `,
})
export class DoSelector {
  readonly value = input<DoSelectorValue | undefined>();
  readonly options = input<DoSelectorOption[]>([]);
  /** 远程拉取；与 options 二选一，优先 payload */
  readonly payload = input<DoSelectorPayload>();
  readonly multiple = input(false);
  readonly clearable = input(true);
  readonly placeholder = input('请选择');
  readonly disabled = input(false);
  readonly width = input<string>();
  readonly valueChange = output<DoSelectorValue>();
  readonly selectChange = output<DoSelectorOption | DoSelectorOption[] | null>();

  private readonly remoteOptions = signal<DoSelectorOption[]>([]);
  protected readonly requesting = signal(false);
  protected readonly resolved = computed(() =>
    this.payload() ? this.remoteOptions() : this.options(),
  );
  /** 上次成功发起请求时的 payload 快照；payload 未变则展开不重拉 */
  private cacheKey: string | null = null;
  private destroyed = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => (this.destroyed = true));
  }

  protected fetchOptions() {
    const payload = this.payload();
    if (!payload) return;
    const key = JSON.stringify(payload);
    if (key === this.cacheKey) return;
    this.cacheKey = key;
    this.requesting.set(true);
    payload
      .requestFunc()
      .then((list) => {
        if (!this.destroyed) this.remoteOptions.set(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        this.cacheKey = null;
      })
      .finally(() => {
        if (!this.destroyed) this.requesting.set(false);
      });
  }

  protected onChange(next: DoSelectorValue | undefined) {
    const value = next ?? null;
    this.valueChange.emit(value);
    if (value == null || value === '') {
      this.selectChange.emit(null);
      return;
    }
    const resolved = this.resolved();
    if (Array.isArray(value)) {
      this.selectChange.emit(resolved.filter((o) => value.includes(o.value)));
    } else {
      this.selectChange.emit(resolved.find((o) => o.value === value) ?? null);
    }
  }
}
