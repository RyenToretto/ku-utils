import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTableModule } from 'ng-zorro-antd/table';

import { CellDateTime } from '@/components/cell-date-time';
import { CellNameId } from '@/components/cell-name-id';
import { CellState } from '@/components/cell-state';
import { DoFilterPanel } from '@/components/do-filter-panel';
import { DoSelectBatchBox, DoSelectCell } from '@/components/do-select-cell';
import { ListPaginationBar } from '@/components/list-pagination-bar';
import { TableWrap, TableWrapFooter } from '@/components/table-wrap';
import { injectAdminTableMaxHeight } from '@/composables/inject-admin-table-max-height';
import { injectFlexColumns } from '@/composables/inject-flex-columns';
import { injectRowSelector } from '@/composables/inject-row-selector';
import { injectTableQuery } from '@/composables/inject-table-query';
import maps from '@/maps';
import { SimpleExampleApi, type SimpleExampleRow } from '@/modules/_example/simpleExample/_api';

const COLUMNS = [
  { key: 'select', width: 55 },
  { key: 'exampleName', minWidth: 160 },
  { key: 'pkg', minWidth: 160 },
  { key: 'status', width: 100 },
  { key: 'createTime', minWidth: 160 },
];

/** 表外全选（#batch 区「全选本页」）+ 行勾选，对齐 kv3 `SimpleExampleBatchSelectList.vue` */
@Component({
  selector: 'ka-simple-example-batch-select-list',
  imports: [
    CellDateTime,
    CellNameId,
    CellState,
    DoFilterPanel,
    DoSelectBatchBox,
    DoSelectCell,
    FormsModule,
    ListPaginationBar,
    NzButtonModule,
    NzInputModule,
    NzRadioModule,
    NzTableModule,
    TableWrap,
    TableWrapFooter,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-simple-example-batch-select' },
  template: `
    <ka-do-filter-panel
      [labelWidth]="80"
      [line]="1"
      [loading]="query.tableLoading()"
      (searchClick)="query.search(true)"
    >
      <div class="do-filter-field">
        <span class="do-filter-field-label">示例名称</span>
        <nz-input-wrapper nzAllowClear>
          <input
            nz-input
            placeholder="不限"
            [ngModel]="query.filters().exampleName"
            (ngModelChange)="query.setListFilters({ exampleName: $event ?? '' })"
            (keydown.enter)="query.search(true)"
          />
        </nz-input-wrapper>
      </div>
      <div class="do-filter-field">
        <span class="do-filter-field-label do-filter-field-label-sm">状态</span>
        <nz-radio-group
          nzButtonStyle="solid"
          nzSize="small"
          [ngModel]="query.filters().status"
          (ngModelChange)="query.setListFilters({ status: $event }); query.search(true)"
        >
          <label
            nz-radio-button
            nzValue=""
          >
            不限
          </label>
          @for (option of statusMap.options; track option.value) {
            <label
              nz-radio-button
              [nzValue]="option.value"
            >
              {{ option.label }}
            </label>
          }
        </nz-radio-group>
      </div>
      <button
        filterCtl
        nz-button
        [disabled]="query.tableLoading()"
        (click)="query.reset()"
      >
        重置
      </button>
    </ka-do-filter-panel>

    <ka-table-wrap [enableDoHeader]="true">
      <div
        tableBatch
        class="batch-select-control"
        [class.is-active]="selector.statusOfSelect() !== 'none-selected'"
        role="checkbox"
        tabindex="0"
        [attr.aria-checked]="ariaChecked()"
        (click)="selector.toggleBatchSelect()"
        (keydown.enter)="$event.preventDefault(); selector.toggleBatchSelect()"
        (keydown.space)="$event.preventDefault(); selector.toggleBatchSelect()"
      >
        <ka-do-select-batch-box [status]="selector.statusOfSelect()" />
        <span class="batch-select-label">全选本页</span>
        @if (selector.selectRows().length) {
          <span class="batch-select-count">已选 {{ selector.selectRows().length }}</span>
        }
      </div>

      <nz-table
        #table
        class="do-inner-scroller page-table"
        nzSize="middle"
        [nzData]="query.tableData()"
        [nzLoading]="query.tableLoading()"
        [nzFrontPagination]="false"
        [nzShowPagination]="false"
        [nzScroll]="{ y: maxHeight() + 'px' }"
        [nzWidthConfig]="columns.widthConfig()"
      >
        <thead>
          <tr>
            <th
              nzLeft
              nzAlign="center"
            ></th>
            <th>示例名称</th>
            <th>产品包名</th>
            <th nzAlign="center">状态</th>
            <th>创建时间</th>
          </tr>
        </thead>
        <tbody>
          @for (row of table.data; track row.id) {
            <tr (click)="selector.chooseRow(row)">
              <td
                nzLeft
                nzAlign="center"
              >
                <ka-do-select-cell
                  [active]="selector.isRowSelected(row)"
                  [transparent]="selector.isRowTransparent(row)"
                  (choose)="selector.chooseRow(row)"
                />
              </td>
              <td
                class="name-slot-cell"
                nzEllipsis
              >
                <ka-cell-name-id
                  [id]="row.id"
                  [name]="row.exampleName"
                />
              </td>
              <td>{{ row.pkg }}</td>
              <td nzAlign="center">
                <ka-cell-state
                  [modelValue]="row.status"
                  [activeValue]="1"
                  [inactiveValue]="0"
                  [activeLabel]="statusMap.getLabel(1)"
                  [inactiveLabel]="statusMap.getLabel(0)"
                />
              </td>
              <td><ka-cell-date-time [value]="row.createTime" /></td>
            </tr>
          }
        </tbody>
      </nz-table>

      <ka-list-pagination-bar
        tableFooter
        [pageNum]="query.pageNum()"
        [pageSize]="query.pageSize()"
        [total]="query.tableTotal()"
        [loading]="query.tableLoading()"
        (pageChange)="query.handlePageChange($event)"
        (sizeChange)="query.handleSizeChange($event)"
      />
    </ka-table-wrap>
  `,
})
export class SimpleExampleBatchSelectList {
  private readonly api = inject(SimpleExampleApi);
  protected readonly statusMap = maps.example.simpleExample.exampleStatus;

  protected readonly query = injectTableQuery<
    SimpleExampleRow,
    { exampleName: string; status: number | '' }
  >({
    defaultFilters: { exampleName: '', status: '' },
    defaultPageSize: 10,
    fetcher: (query, signal) => this.api.requestSimpleExampleList(query, signal),
  });
  protected readonly selector = injectRowSelector<SimpleExampleRow>({
    tableData: this.query.tableData,
    lineKey: 'id',
    isMultiple: true,
  });
  protected readonly maxHeight = injectAdminTableMaxHeight(
    '.page-simple-example-batch-select',
    400,
  );
  protected readonly columns = injectFlexColumns(COLUMNS, '.page-simple-example-batch-select');

  protected ariaChecked() {
    const status = this.selector.statusOfSelect();
    if (status === 'all-selected') return 'true';
    return status === 'half-selected' ? 'mixed' : 'false';
  }
}
