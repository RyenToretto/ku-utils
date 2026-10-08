import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTableModule } from 'ng-zorro-antd/table';

import { DialogEditClazzManage } from './dialog-edit-clazz-manage';

import { CellDateTime } from '@/components/cell-date-time';
import { CellNameId } from '@/components/cell-name-id';
import { CellState } from '@/components/cell-state';
import { DoFilterPanel } from '@/components/do-filter-panel';
import { ListPaginationBar } from '@/components/list-pagination-bar';
import { TableWrap, TableWrapFooter } from '@/components/table-wrap';
import { injectAdminTableMaxHeight } from '@/composables/inject-admin-table-max-height';
import { injectFlexColumns } from '@/composables/inject-flex-columns';
import { injectTableQuery } from '@/composables/inject-table-query';
import maps from '@/maps';
import { ClazzManageApi, type ClazzManageRow } from '@/modules/_example/clazzManage/_api';
import {
  CLAZZ_STATUS_DISABLED,
  CLAZZ_STATUS_ENABLED,
} from '@/modules/_example/clazzManage/_map/clazz-status';
import { injectConfirm } from '@/plugins/confirm';

const PAGE_SELECTOR = '.page-clazz-manage';

const COLUMNS = [
  { key: 'clazzName', minWidth: 160 },
  { key: 'schoolName', minWidth: 160 },
  { key: 'status', width: 100 },
  { key: 'createTime', minWidth: 160 },
  { key: 'ops', width: 140 },
];

@Component({
  selector: 'ka-clazz-manage-list',
  imports: [
    CellDateTime,
    CellNameId,
    CellState,
    DialogEditClazzManage,
    DoFilterPanel,
    FormsModule,
    ListPaginationBar,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzRadioModule,
    NzTableModule,
    TableWrap,
    TableWrapFooter,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-clazz-manage' },
  template: `
    <ka-do-filter-panel
      [labelWidth]="80"
      [line]="1"
      [loading]="query.tableLoading()"
      (searchClick)="query.search(true)"
    >
      <div class="do-filter-field">
        <span class="do-filter-field-label">班级名称</span>
        <nz-input-wrapper nzAllowClear>
          <input
            nz-input
            placeholder="不限"
            [ngModel]="query.filters().clazzName"
            (ngModelChange)="query.setListFilters({ clazzName: $event ?? '' })"
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

    <ka-table-wrap>
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
            <th>班级名称</th>
            <th>所属学校</th>
            <th nzAlign="center">状态</th>
            <th>创建时间</th>
            <th
              nzRight
              class="ops-column"
            >
              <button
                nz-button
                nzType="primary"
                nzSize="small"
                (click)="openEdit(null)"
              >
                新建班级
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          @for (row of table.data; track row.id) {
            <tr>
              <td class="name-slot-cell">
                <ka-cell-name-id
                  [id]="row.id"
                  [name]="row.clazzName"
                />
              </td>
              <td nzEllipsis>{{ row.schoolName || '—' }}</td>
              <td nzAlign="center">
                <ka-cell-state
                  [modelValue]="row.status"
                  [activeValue]="enabled"
                  [inactiveValue]="disabled"
                  [activeLabel]="statusMap.getLabel(enabled)"
                  [inactiveLabel]="statusMap.getLabel(disabled)"
                />
              </td>
              <td><ka-cell-date-time [value]="row.createTime" /></td>
              <td
                nzRight
                class="ops-column"
              >
                <div class="line-actions">
                  <button
                    nz-button
                    class="btn-plain-primary"
                    nzSize="small"
                    title="编辑"
                    aria-label="编辑"
                    (click)="openEdit(row)"
                  >
                    <nz-icon nzType="edit" />
                  </button>
                  <button
                    nz-button
                    class="btn-plain-danger"
                    nzSize="small"
                    title="删除"
                    aria-label="删除"
                    (click)="confirmDelete(row)"
                  >
                    <nz-icon nzType="delete" />
                  </button>
                </div>
              </td>
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
        [enableRefresh]="true"
        (pageChange)="query.handlePageChange($event)"
        (sizeChange)="query.handleSizeChange($event)"
        (refresh)="query.search(false)"
      />
    </ka-table-wrap>

    <ka-dialog-edit-clazz-manage
      [open]="editOpen()"
      [row]="editRow()"
      (closed)="editOpen.set(false)"
      (success)="query.search(false)"
    />
  `,
})
export class ClazzManageList {
  private readonly api = inject(ClazzManageApi);
  private readonly message = inject(NzMessageService);
  private readonly confirm = injectConfirm();
  protected readonly statusMap = maps.example.clazzManage.clazzStatus;
  protected readonly enabled = CLAZZ_STATUS_ENABLED;
  protected readonly disabled = CLAZZ_STATUS_DISABLED;

  protected readonly editOpen = signal(false);
  protected readonly editRow = signal<ClazzManageRow | null>(null);

  protected readonly query = injectTableQuery<
    ClazzManageRow,
    { clazzName: string; status: number | '' }
  >({
    defaultFilters: { clazzName: '', status: '' },
    defaultPageSize: 10,
    fetcher: (query, signal) => this.api.requestClazzManageList(query, signal),
  });
  protected readonly maxHeight = injectAdminTableMaxHeight(PAGE_SELECTOR, 400);
  protected readonly columns = injectFlexColumns(COLUMNS, PAGE_SELECTOR);

  protected openEdit(row: ClazzManageRow | null) {
    this.editRow.set(row);
    this.editOpen.set(true);
  }

  protected confirmDelete(row: ClazzManageRow) {
    this.confirm({
      content: `确认删除「${row.clazzName}」？`,
      onOk: async () => {
        await this.api.requestDeleteClazzManage({ id: row.id });
        this.message.success('删除成功');
        void this.query.search(false);
      },
    });
  }
}
