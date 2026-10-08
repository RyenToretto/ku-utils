import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopoverModule } from 'ng-zorro-antd/popover';

import { injectSchemaColumnConfigHost } from '../context';
import { DEFAULT_CUSTOM_COLUMN_MESSAGES } from '../schema-column-config';
import type { ColumnConfig } from '../types';

import { KuDoConfigColumnDialog } from './do-config-column-dialog';
import { KuDoReadColumnConfig } from './do-read-column-config';

/**
 * 表格工具栏：左侧批量区（`[kuTableBatch]` 投影）、右侧控件区（`[kuTableControl]` 投影）+「自定义列」。
 * 悬停「自定义列」列出本地配置，「自定义配置」打开配置抽屉；需在 `[kuSchemaColumnConfig]` 子树内使用。
 */
@Component({
  selector: 'ku-do-table-header',
  imports: [NzButtonModule, NzPopoverModule, KuDoConfigColumnDialog, KuDoReadColumnConfig],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: '../style.css',
  host: { class: 'do-table-header' },
  template: `
    @if (hasConfig()) {
      <ku-do-config-column-dialog (confirm)="applyColumnConfig($event)" />
    }

    <div class="table-batch"><ng-content select="[kuTableBatch]" /></div>
    <div class="table-control">
      <ng-content select="[kuTableControl]" />
      @if (!disabledColumnConfig()) {
        <button
          nz-button
          nzSize="small"
          class="do-table-control-btn"
          nz-popover
          nzPopoverTrigger="hover"
          nzPopoverPlacement="bottom"
          nzPopoverOverlayClassName="do-table-config-popper"
          [nzPopoverMouseEnterDelay]="0"
          [nzPopoverMouseLeaveDelay]="0.2"
          [nzPopoverVisible]="popoverOpen()"
          [nzPopoverContent]="readTpl"
          (nzPopoverVisibleChange)="popoverOpen.set($event)"
        >
          {{ messages().customColumns }}
        </button>
        <ng-template #readTpl>
          <ku-do-read-column-config
            disabledDelete
            showCustomConfigButton
            (confirm)="applyColumnConfig($event)"
            (remove)="removeConfig($event)"
            (custom)="openDialog($event)"
            (closed)="popoverOpen.set(false)"
          />
        </ng-template>
      }
    </div>
  `,
})
export class KuDoTableHeader {
  /** 隐藏「自定义列」入口，默认 true */
  readonly disabledColumnConfig = input(true, { transform: booleanAttribute });

  private readonly host = injectSchemaColumnConfigHost();
  private readonly dialog = viewChild(KuDoConfigColumnDialog);

  protected readonly popoverOpen = signal(false);
  protected readonly hasConfig = computed(() => !!this.host);
  protected readonly messages = computed(
    () => this.host?.config().messages ?? DEFAULT_CUSTOM_COLUMN_MESSAGES,
  );

  protected applyColumnConfig(config: ColumnConfig): void {
    this.host?.config().applyColumnConfig(config);
  }

  protected removeConfig(label: string): void {
    this.host?.config().removeConfigFromLocal(label);
  }

  protected openDialog(config: ColumnConfig | undefined): void {
    this.popoverOpen.set(false);
    this.dialog()?.showConfigColumnDialog(config);
  }
}
