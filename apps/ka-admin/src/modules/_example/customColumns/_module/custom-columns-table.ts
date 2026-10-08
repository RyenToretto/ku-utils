import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  Directive,
  inject,
  input,
  signal,
  TemplateRef,
} from '@angular/core';
import {
  KuSchemaCell,
  KuSchemaColumnConfig,
  KuSchemaHeader,
  type ColumnSchema,
} from '@ku-utils/a-custom-columns';
import type { NzTableSortOrder } from 'ng-zorro-antd/table';
import { NzTableModule } from 'ng-zorro-antd/table';

import { TableWrap } from '@/components/table-wrap';
import { injectAdminTableMaxHeight } from '@/composables/inject-admin-table-max-height';
import { injectFlexColumns, type FlexColumn } from '@/composables/inject-flex-columns';
import type { CustomColumnsDemoRow } from '@/modules/_example/customColumns/_api/custom-columns';

/** 右侧钉住的操作列：`<ng-template kaCustomColumnsOps let-row>…</ng-template>` */
@Directive({ selector: 'ng-template[kaCustomColumnsOps]' })
export class CustomColumnsOpsDef {
  readonly label = input('操作');
  readonly width = input(100);
  readonly template = inject<TemplateRef<{ $implicit: CustomColumnsDemoRow }>>(TemplateRef);
}

type SortState = { prop: string; order: 'ascend' | 'descend' };

const PAGE_SELECTOR = '.custom-columns-table';

/**
 * 自定义列 Demo 共用表格（对齐 kr `CustomColumnsDemo` 的 Table 段）：
 * 钉左 ID / 名称 + schema 列（多行表头）+ 可选钉右操作列；
 * 宿主须挂 `[kuSchemaColumnConfig]`，页面内 `kuSchemaCellDef` / `kuSchemaHeaderDef` 随之生效。
 */
@Component({
  selector: 'ka-custom-columns-table',
  imports: [KuSchemaCell, KuSchemaHeader, NgTemplateOutlet, NzTableModule, TableWrap],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'custom-columns-table' },
  template: `
    <ka-table-wrap
      [enableDoHeader]="true"
      [disabledColumnConfig]="false"
    >
      <nz-table
        #table
        class="do-inner-scroller page-table"
        nzSize="middle"
        [nzData]="sortedRows()"
        [nzLoading]="loading()"
        [nzFrontPagination]="false"
        [nzShowPagination]="false"
        [nzScroll]="{ x: 'max-content', y: maxHeight() + 'px' }"
        [nzWidthConfig]="columns.widthConfig()"
      >
        <thead>
          @for (headerRow of config().headerRows(); track $index; let first = $first) {
            <tr>
              @if (first) {
                <th
                  nzLeft
                  nzAlign="center"
                  [attr.rowspan]="headerRowSpan()"
                >
                  ID
                </th>
                <th
                  nzLeft
                  [attr.rowspan]="headerRowSpan()"
                >
                  名称
                </th>
              }
              @for (cell of headerRow; track cell.key) {
                <th
                  [nzAlign]="cell.schema.align ?? null"
                  [nzLeft]="cell.schema.zorroAttrs?.nzLeft ?? false"
                  [nzRight]="cell.schema.zorroAttrs?.nzRight ?? false"
                  [nzShowSort]="isSortable(cell.schema, cell.isLeaf)"
                  [nzSortOrder]="sortOrderOf(cell.schema.prop)"
                  (nzSortOrderChange)="onSortChange(cell.schema.prop, $event)"
                  [attr.colspan]="cell.colspan > 1 ? cell.colspan : null"
                  [attr.rowspan]="cell.rowspan > 1 ? cell.rowspan : null"
                >
                  <ku-schema-header [schema]="cell.schema" />
                </th>
              }
              @let ops = opsDef();
              @if (first && ops) {
                <th
                  nzRight
                  class="ops-column"
                  [attr.rowspan]="headerRowSpan()"
                >
                  {{ ops.label() }}
                </th>
              }
            </tr>
          }
        </thead>
        <tbody>
          @for (row of table.data; track row.id; let i = $index) {
            <tr>
              <td
                nzLeft
                nzAlign="center"
              >
                {{ row.id }}
              </td>
              <td nzLeft>{{ row.name }}</td>
              @for (schema of config().visibleLeafSchemas(); track schema.prop) {
                <td
                  [nzAlign]="schema.align ?? null"
                  [nzEllipsis]="!!schema.zorroAttrs?.nzEllipsis"
                  [nzBreakWord]="!!schema.zorroAttrs?.nzBreakWord"
                  [nzLeft]="schema.zorroAttrs?.nzLeft ?? false"
                  [nzRight]="schema.zorroAttrs?.nzRight ?? false"
                >
                  <ku-schema-cell
                    [schema]="schema"
                    [row]="row"
                    [index]="i"
                  />
                </td>
              }
              @let ops = opsDef();
              @if (ops) {
                <td
                  nzRight
                  class="ops-column"
                >
                  <ng-container *ngTemplateOutlet="ops.template; context: { $implicit: row }" />
                </td>
              }
            </tr>
          }
        </tbody>
      </nz-table>
    </ka-table-wrap>
  `,
})
export class CustomColumnsTable {
  readonly rows = input.required<CustomColumnsDemoRow[]>();
  readonly loading = input(false);
  /** false 时忽略 schema.sortable（03 插槽页） */
  readonly sortable = input(true);
  readonly idWidth = input(60);
  readonly nameMinWidth = input(120);

  private readonly host = inject(KuSchemaColumnConfig);
  protected readonly config = computed(() => this.host.config());
  protected readonly opsDef = contentChild(CustomColumnsOpsDef);
  private readonly sortState = signal<SortState | null>(null);

  protected readonly headerRowSpan = computed(() => {
    const depth = this.config().headerRows().length;
    return depth > 1 ? depth : null;
  });

  private readonly flexColumns = computed<FlexColumn[]>(() => {
    const ops = this.opsDef();
    return [
      { key: 'id', width: this.idWidth() },
      { key: 'name', minWidth: this.nameMinWidth() },
      ...this.config()
        .visibleLeafSchemas()
        .map((schema) => ({ key: schema.prop!, width: schema.width, minWidth: schema.minWidth })),
      ...(ops ? [{ key: 'ops', width: ops.width() }] : []),
    ];
  });

  protected readonly maxHeight = injectAdminTableMaxHeight(PAGE_SELECTOR, 400);
  protected readonly columns = injectFlexColumns(this.flexColumns, PAGE_SELECTOR);

  protected readonly sortedRows = computed(() => {
    const rows = this.rows();
    const sort = this.sortState();
    if (!sort) return rows;
    const factor = sort.order === 'ascend' ? 1 : -1;
    const valueOf = (row: CustomColumnsDemoRow) => Number(row[sort.prop] ?? 0);
    return [...rows].sort((a, b) => (valueOf(a) - valueOf(b)) * factor);
  });

  protected isSortable(schema: ColumnSchema, isLeaf: boolean) {
    return this.sortable() && isLeaf && !!schema.sortable;
  }

  protected sortOrderOf(prop: string | undefined): NzTableSortOrder {
    const sort = this.sortState();
    return prop && sort?.prop === prop ? sort.order : null;
  }

  protected onSortChange(prop: string | undefined, order: NzTableSortOrder) {
    if (!prop) return;
    if (order === 'ascend' || order === 'descend') this.sortState.set({ prop, order });
    else if (this.sortState()?.prop === prop) this.sortState.set(null);
  }
}
