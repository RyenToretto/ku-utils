import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { CloseOutline } from '@ant-design/icons-angular/icons';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule, provideNzIconsPatch } from 'ng-zorro-antd/icon';

import { injectSchemaColumnConfigHost } from '../context';
import { DEFAULT_CUSTOM_COLUMN_MESSAGES } from '../schema-column-config';
import type { ColumnConfig } from '../types';

/**
 * 本地配置列表：激活项高亮，其余半透明；悬停非系统配置时显示删除。
 */
@Component({
  selector: 'ku-do-read-column-config',
  imports: [NzButtonModule, NzIconModule],
  providers: [provideNzIconsPatch([CloseOutline])],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: '../style.css',
  host: { class: 'do-read-column-config' },
  template: `
    @for (item of configList(); track item.label) {
      <div class="read-from-local-line">
        <button
          nz-button
          nzSize="small"
          class="read-from-local-config"
          [class.active]="item.label === currentLabel()"
          (click)="choose(item)"
        >
          {{ item.label }}
        </button>
        @if (!disabledDelete() && !isSystem(item.label)) {
          <span
            nz-icon
            nzType="close"
            class="read-from-local-delete"
            role="button"
            tabindex="0"
            aria-label="删除配置"
            (click)="removeConfig(item.label)"
            (keydown.enter)="removeConfig(item.label)"
          ></span>
        }
      </div>
    }

    @if (!disabledCancelButton()) {
      <div class="read-from-local-line">
        <button
          nz-button
          nzSize="small"
          class="read-from-local-config active"
          (click)="closed.emit()"
        >
          {{ messages().cancel }}
        </button>
      </div>
    }

    @if (showCustomConfigButton()) {
      <div class="read-from-local-line">
        <button
          nz-button
          nzSize="small"
          class="read-from-local-config custom"
          (click)="emitCustom()"
        >
          {{ messages().customConfig }}
        </button>
      </div>
    }
  `,
})
export class KuDoReadColumnConfig {
  /** 隐藏用户配置的删除按钮 */
  readonly disabledDelete = input(false, { transform: booleanAttribute });
  /** 隐藏「取消」按钮，默认 true */
  readonly disabledCancelButton = input(true, { transform: booleanAttribute });
  /** 显示「自定义配置」按钮 */
  readonly showCustomConfigButton = input(false, { transform: booleanAttribute });

  readonly confirm = output<ColumnConfig>();
  readonly remove = output<string>();
  /** 点击「自定义配置」，携带当前激活配置 */
  readonly custom = output<ColumnConfig | undefined>();
  readonly closed = output<void>();

  private readonly host = injectSchemaColumnConfigHost();

  protected readonly messages = computed(
    () => this.host?.config().messages ?? DEFAULT_CUSTOM_COLUMN_MESSAGES,
  );

  private readonly cache = computed(() => {
    const config = this.host?.config();
    if (!config) return null;
    // 订阅存储变化，保证保存/删除/切换后列表刷新
    config.columnConfig();
    config.activeColumnConfigLabel();
    return config.readCacheConfig();
  });

  protected readonly configList = computed(() => this.cache()?.columnConfig ?? []);
  protected readonly currentLabel = computed(() => this.cache()?.activeColumnConfigLabel ?? '');

  protected isSystem(label: string): boolean {
    return this.host?.config().existAlreadyWithSystem(label) ?? true;
  }

  protected choose(config: ColumnConfig): void {
    this.confirm.emit(config);
    this.closed.emit();
  }

  protected removeConfig(label: string): void {
    this.remove.emit(label);
    this.closed.emit();
  }

  protected emitCustom(): void {
    const label = this.currentLabel();
    this.custom.emit(this.configList().find((c) => c.label === label));
  }
}
