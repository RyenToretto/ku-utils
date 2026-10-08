import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';

import { CellDateTime } from '@/components/cell-date-time';
import { CellState, type StateValue } from '@/components/cell-state';
import { DateRange, type DateRangeValue } from '@/components/date-range';
import { DoFilterPanel } from '@/components/do-filter-panel';
import { DoNumberSetter } from '@/components/do-number-setter';
import { DoSelector, type DoSelectorValue } from '@/components/do-selector';
import { DoTxtSetter } from '@/components/do-txt-setter';
import { ListPaginationBar } from '@/components/list-pagination-bar';
import { TableWrap, TableWrapFooter } from '@/components/table-wrap';
import { injectAdminTableMaxHeight } from '@/composables/inject-admin-table-max-height';
import { injectFlexColumns } from '@/composables/inject-flex-columns';
import { injectTableQuery } from '@/composables/inject-table-query';

type DemoRow = {
  id: number;
  name: string;
  status: number;
  createdAt: string;
  amount: number;
  switching?: boolean;
  amountChanging?: boolean;
  [key: string]: unknown;
};

type DemoFilters = { keyword: string; status: string | number; dateRange: DateRangeValue };

const ALL_ROWS: DemoRow[] = [
  { id: 1, name: '春日投放计划', status: 1, createdAt: '2026-03-01 09:12:33', amount: 1200 },
  { id: 2, name: '品牌曝光任务', status: 0, createdAt: '2026-03-05 14:22:01', amount: 860 },
  { id: 3, name: '拉新激励活动', status: 1, createdAt: '2026-03-12 18:40:55', amount: 2300 },
  { id: 4, name: '周末冲刺预算', status: 1, createdAt: '2026-04-02 08:05:12', amount: 540 },
  { id: 5, name: '召回短信批次', status: 0, createdAt: '2026-04-18 11:33:47', amount: 980 },
  { id: 6, name: '素材 A/B 测试', status: 1, createdAt: '2026-05-01 16:20:00', amount: 150 },
  { id: 7, name: '渠道联调样例', status: 1, createdAt: '2026-05-20 10:01:19', amount: 3200 },
  { id: 8, name: '停用归档任务', status: 0, createdAt: '2026-06-03 21:15:44', amount: 70 },
  { id: 9, name: '节日大促排期', status: 1, createdAt: '2026-06-18 09:40:00', amount: 4500 },
  { id: 10, name: '冷启动观察组', status: 0, createdAt: '2026-07-02 15:08:26', amount: 260 },
];

const STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
];

const PAGE_SELECTOR = '.page-ui-kit-panel';

const COLUMNS = [
  { key: 'id', width: 70 },
  { key: 'name', minWidth: 140 },
  { key: 'status', width: 120 },
  { key: 'createdAt', minWidth: 160 },
  { key: 'amount', width: 140 },
];

@Component({
  selector: 'ka-ui-kit-panel-demo',
  imports: [
    CellDateTime,
    CellState,
    DateRange,
    DoFilterPanel,
    DoNumberSetter,
    DoSelector,
    DoTxtSetter,
    ListPaginationBar,
    NzButtonModule,
    NzTableModule,
    TableWrap,
    TableWrapFooter,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-ui-kit-panel' },
  template: `
    <ka-do-filter-panel
      [labelWidth]="80"
      [line]="1"
      [loading]="query.tableLoading()"
      (searchClick)="query.search(true)"
    >
      <div class="do-filter-field">
        <span class="do-filter-field-label">日期</span>
        <ka-date-range
          [width]="240"
          [value]="query.filters().dateRange"
          (valueChange)="query.setListFilters({ dateRange: $event }); query.search(true)"
        />
      </div>
      <div class="do-filter-field">
        <span class="do-filter-field-label">关键字</span>
        <ka-do-txt-setter
          [inline]="true"
          [initValue]="query.filters().keyword"
          [ok]="onKeywordOk"
        >
          <span class="line-txt">{{ query.filters().keyword || '点击编辑关键字' }}</span>
        </ka-do-txt-setter>
      </div>
      <div class="do-filter-field">
        <span class="do-filter-field-label">状态</span>
        <ka-do-selector
          width="140px"
          [value]="query.filters().status === '' ? null : query.filters().status"
          [options]="statusOptions"
          (valueChange)="onStatusChange($event)"
        />
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
      <button
        tableControl
        nz-button
        nzType="primary"
        (click)="message.success('演示：新建')"
      >
        新建
      </button>

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
            <th nzAlign="center">ID</th>
            <th>名称</th>
            <th nzAlign="center">状态</th>
            <th>创建时间</th>
            <th nzAlign="right">数量</th>
          </tr>
        </thead>
        <tbody>
          @for (row of table.data; track row.id) {
            <tr>
              <td nzAlign="center">{{ row.id }}</td>
              <td>{{ row.name }}</td>
              <td nzAlign="center">
                <ka-cell-state
                  [modelValue]="row.status"
                  [switchable]="true"
                  [switching]="!!row.switching"
                  (switchChange)="onSwitch(row, $event)"
                />
              </td>
              <td><ka-cell-date-time [value]="row.createdAt" /></td>
              <td nzAlign="right">
                <ka-do-number-setter
                  [num]="row.amount"
                  [newValue]="row.amount"
                  [changing]="!!row.amountChanging"
                  [ok]="amountOk(row)"
                >
                  {{ row.amount }}
                </ka-do-number-setter>
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
        (pageChange)="query.handlePageChange($event)"
        (sizeChange)="query.handleSizeChange($event)"
      />
    </ka-table-wrap>
  `,
})
export default class UiKitPanelDemo {
  protected readonly message = inject(NzMessageService);
  protected readonly statusOptions = STATUS_OPTIONS;
  private rows = ALL_ROWS.map((row) => ({ ...row }));

  protected readonly query = injectTableQuery<DemoRow, DemoFilters>({
    defaultFilters: { keyword: '', status: '', dateRange: [] },
    defaultPageSize: 10,
    fetcher: async (query) => {
      await new Promise((resolve) => setTimeout(resolve, 280));
      const keyword = String(query['keyword'] || '');
      const status = query['status'];
      const dateRange = (query['dateRange'] as string[]) || [];
      const filtered = this.rows.filter((row) => {
        if (keyword && !row.name.includes(keyword)) return false;
        if (status !== '' && status != null && row.status !== Number(status)) return false;
        if (dateRange.length === 2) {
          const [start, end] = dateRange;
          const day = row.createdAt.slice(0, 10);
          if (day < start! || day > end!) return false;
        }
        return true;
      });
      const pageNum = Number(query['pageNum']) || 1;
      const pageSize = Number(query['pageSize']) || 10;
      const start = (pageNum - 1) * pageSize;
      return { data: { lists: filtered.slice(start, start + pageSize), total: filtered.length } };
    },
  });
  protected readonly maxHeight = injectAdminTableMaxHeight(PAGE_SELECTOR, 400);
  protected readonly columns = injectFlexColumns(COLUMNS, PAGE_SELECTOR);

  protected readonly onKeywordOk = (value: string) => {
    this.query.setListFilters({ keyword: value ?? '' });
    void this.query.search(true);
  };

  protected onStatusChange(value: DoSelectorValue) {
    this.query.setListFilters({ status: (value as number | null) ?? '' });
    void this.query.search(true);
  }

  private updateRow(id: number, patch: Partial<DemoRow>) {
    this.rows = this.rows.map((row) => (row.id === id ? { ...row, ...patch } : row));
  }

  protected onSwitch(row: DemoRow, value: StateValue) {
    const isRow = (r: DemoRow) => r.id === row.id;
    this.query.patchRow(isRow, { switching: true });
    setTimeout(() => {
      const status = Number(value);
      this.updateRow(row.id, { status });
      this.query.patchRow(isRow, { status, switching: false });
      this.message.success(`已${status === 1 ? '启用' : '禁用'}：${row.name}`);
    }, 400);
  }

  protected amountOk(row: DemoRow) {
    return (value: number) => {
      const isRow = (r: DemoRow) => r.id === row.id;
      this.query.patchRow(isRow, { amountChanging: true });
      setTimeout(() => {
        this.updateRow(row.id, { amount: value });
        this.query.patchRow(isRow, { amount: value, amountChanging: false });
        this.message.success(`数量已更新为 ${value}`);
      }, 350);
    };
  }
}
