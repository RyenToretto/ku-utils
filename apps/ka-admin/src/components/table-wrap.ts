import { ChangeDetectionStrategy, Component, contentChild, Directive, input } from '@angular/core';
import { KuDoTableHeader } from '@ku-utils/a-custom-columns';

/** `TableWrap` 无 DoHeader 时的表头区：`<div tableHeader>` */
@Directive({ selector: '[tableHeader]' })
export class TableWrapHeader {}

/** `TableWrap` 底部区（分页条等）：`<div tableFooter>` */
@Directive({ selector: '[tableFooter]' })
export class TableWrapFooter {}

/**
 * 列表表格外壳：与 kv3 / kr TableWrap 对齐。
 * `enableDoHeader` 时内置 DoTableHeader（`[tableBatch]` 左 / `[tableControl]` 右 / 自定义列）；
 * 自定义列页设 `[disabledColumnConfig]="false"`。
 */
@Component({
  selector: 'ka-table-wrap',
  imports: [KuDoTableHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'table-wrap',
    '[attr.aria-label]': 'ariaLabel()',
  },
  template: `
    @if (enableDoHeader()) {
      <ku-do-table-header [disabledColumnConfig]="disabledColumnConfig()">
        <ng-container ngProjectAs="[kuTableBatch]">
          <ng-content select="[tableBatch]" />
        </ng-container>
        <ng-container ngProjectAs="[kuTableControl]">
          <ng-content select="[tableControl]" />
        </ng-container>
      </ku-do-table-header>
    }
    @if (!enableDoHeader() && header()) {
      <div class="table-wrap-hd">
        <ng-content select="[tableHeader]" />
      </div>
    }
    <div class="table-wrap-bd">
      <ng-content />
    </div>
    @if (footer()) {
      <div class="table-wrap-ft">
        <ng-content select="[tableFooter]" />
      </div>
    }
  `,
})
export class TableWrap {
  readonly enableDoHeader = input(false);
  /** true 时隐藏「自定义列」按钮（学校列表等默认 true） */
  readonly disabledColumnConfig = input(true);
  readonly ariaLabel = input('数据表格');

  protected readonly header = contentChild(TableWrapHeader);
  protected readonly footer = contentChild(TableWrapFooter);
}
