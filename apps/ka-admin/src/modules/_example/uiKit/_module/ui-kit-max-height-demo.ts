import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { CellDateTime } from '@/components/cell-date-time';
import { DateRange, type DateRangeValue } from '@/components/date-range';
import { DoFilterPanel } from '@/components/do-filter-panel';
import { ListPaginationBar } from '@/components/list-pagination-bar';
import { TableWrap, TableWrapFooter } from '@/components/table-wrap';
import { injectAdminTableMaxHeight } from '@/composables/inject-admin-table-max-height';
import { injectFlexColumns } from '@/composables/inject-flex-columns';
import { injectTableQuery } from '@/composables/inject-table-query';

type DemoRow = {
  id: string;
  name: string;
  colA: string;
  colB: string;
  colC: string;
  colD: string;
  colE: string;
  colF: string;
  owner: string;
  status: number;
  createdAt: string;
  channel: string;
  region: string;
  tag: string;
  [key: string]: unknown;
};

type DemoFilters = {
  dateRange: DateRangeValue;
  keyword: string;
  status: string | number;
  owner: string;
  channel: string;
  region: string;
  tag: string;
};

const CHANNEL_OPTIONS = [
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Meta', value: 'meta' },
];

const REGION_OPTIONS = [
  { label: '北京', value: 'bj' },
  { label: '上海', value: 'sh' },
  { label: '深圳', value: 'sz' },
];

const SEED_ROWS: DemoRow[] = Array.from({ length: 16 }, (_, i) => {
  const n = i + 1;
  return {
    id: String(n),
    name: `演示策略 ${n}`,
    colA: `列A-${n}`,
    colB: `列B-${n}`,
    colC: `列C-${n}`,
    colD: `列D-${n}`,
    colE: `列E-${n}`,
    colF: `列F-${n}`,
    owner: n % 2 === 0 ? '王婧婷' : '张伟',
    status: n % 3 === 0 ? 0 : 1,
    createdAt: `2026-08-${String((n % 28) + 1).padStart(2, '0')}T12:00:00+08:00`,
    channel: n % 2 === 0 ? 'tiktok' : 'meta',
    region: ['bj', 'sh', 'sz'][n % 3]!,
    tag: `tag-${n}`,
  };
});

const DATA_COLUMNS = ['colA', 'colB', 'colC', 'colD', 'colE', 'colF'] as const;

const PAGE_SELECTOR = '.page-ui-kit-max-height';

const COLUMNS = [
  { key: 'name', minWidth: 200 },
  ...DATA_COLUMNS.map((key) => ({ key, minWidth: 140 })),
  { key: 'createdAt', width: 160 },
  { key: 'ops', width: 220 },
];

@Component({
  selector: 'ka-ui-kit-max-height-demo',
  imports: [
    CellDateTime,
    DateRange,
    DoFilterPanel,
    FormsModule,
    ListPaginationBar,
    NzButtonModule,
    NzInputModule,
    NzRadioModule,
    NzSelectModule,
    NzTableModule,
    TableWrap,
    TableWrapFooter,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-ui-kit-max-height' },
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
          (valueChange)="query.setListFilters({ dateRange: $event })"
        />
      </div>
      <div class="do-filter-field">
        <span class="do-filter-field-label">关键字</span>
        <nz-input-wrapper
          nzAllowClear
          [style.width.px]="180"
        >
          <input
            nz-input
            placeholder="不限"
            [ngModel]="query.filters().keyword"
            (ngModelChange)="query.setListFilters({ keyword: $event ?? '' })"
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
          <label
            nz-radio-button
            [nzValue]="1"
          >
            启用
          </label>
          <label
            nz-radio-button
            [nzValue]="0"
          >
            停用
          </label>
        </nz-radio-group>
      </div>
      <div class="do-filter-field">
        <span class="do-filter-field-label">负责人</span>
        <nz-input-wrapper
          nzAllowClear
          [style.width.px]="140"
        >
          <input
            nz-input
            placeholder="不限"
            [ngModel]="query.filters().owner"
            (ngModelChange)="query.setListFilters({ owner: $event ?? '' })"
          />
        </nz-input-wrapper>
      </div>
      <div class="do-filter-field">
        <span class="do-filter-field-label">渠道</span>
        <nz-select
          nzAllowClear
          nzPlaceHolder="不限"
          [style.width.px]="140"
          [nzOptions]="channelOptions"
          [ngModel]="query.filters().channel || null"
          (ngModelChange)="query.setListFilters({ channel: $event ?? '' })"
        />
      </div>
      <div class="do-filter-field">
        <span class="do-filter-field-label">地区</span>
        <nz-select
          nzAllowClear
          nzPlaceHolder="不限"
          [style.width.px]="140"
          [nzOptions]="regionOptions"
          [ngModel]="query.filters().region || null"
          (ngModelChange)="query.setListFilters({ region: $event ?? '' })"
        />
      </div>
      <div class="do-filter-field">
        <span class="do-filter-field-label">标签</span>
        <nz-input-wrapper
          nzAllowClear
          [style.width.px]="140"
        >
          <input
            nz-input
            placeholder="不限"
            [ngModel]="query.filters().tag"
            (ngModelChange)="query.setListFilters({ tag: $event ?? '' })"
          />
        </nz-input-wrapper>
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
        [nzScroll]="{ x: '1400px', y: maxHeight() + 'px' }"
        [nzWidthConfig]="columns.widthConfig()"
      >
        <thead>
          <tr>
            <th nzLeft>名称</th>
            @for (key of dataColumns; track key) {
              <th>列 {{ key.slice(3) }}</th>
            }
            <th>创建时间</th>
            <th
              nzRight
              class="ops-column"
            >
              <button
                nz-button
                nzType="primary"
                nzSize="small"
              >
                新建
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          @for (row of table.data; track row.id) {
            <tr>
              <td nzLeft>{{ row.name }}</td>
              @for (key of dataColumns; track key) {
                <td>{{ row[key] }}</td>
              }
              <td>
                <ka-cell-date-time
                  layout="with-actor"
                  [value]="row.createdAt"
                  [actor]="row.owner"
                />
              </td>
              <td
                nzRight
                class="ops-column"
              >
                <div class="line-actions">
                  <button
                    nz-button
                    nzSize="small"
                  >
                    编辑
                  </button>
                  <button
                    nz-button
                    nzSize="small"
                  >
                    复制
                  </button>
                  <button
                    nz-button
                    nzType="primary"
                    nzGhost
                    nzSize="small"
                  >
                    立即使用
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
        (pageChange)="query.handlePageChange($event)"
        (sizeChange)="query.handleSizeChange($event)"
      />
    </ka-table-wrap>
  `,
})
export default class UiKitMaxHeightDemo {
  protected readonly channelOptions = CHANNEL_OPTIONS;
  protected readonly regionOptions = REGION_OPTIONS;
  protected readonly dataColumns = DATA_COLUMNS;

  protected readonly query = injectTableQuery<DemoRow, DemoFilters>({
    defaultFilters: {
      dateRange: [],
      keyword: '',
      status: '',
      owner: '',
      channel: '',
      region: '',
      tag: '',
    },
    defaultPageSize: 20,
    fetcher: async (query) => {
      const keyword = String(query['keyword'] ?? '').trim();
      const status = query['status'];
      const owner = String(query['owner'] ?? '').trim();
      const channel = String(query['channel'] ?? '');
      const region = String(query['region'] ?? '');
      const tag = String(query['tag'] ?? '').trim();
      const lists = SEED_ROWS.filter((row) => {
        if (keyword && !row.name.includes(keyword) && !row.id.includes(keyword)) return false;
        if (status !== '' && status != null && Number(status) !== row.status) return false;
        if (owner && !row.owner.includes(owner)) return false;
        if (channel && row.channel !== channel) return false;
        if (region && row.region !== region) return false;
        if (tag && !row.tag.includes(tag)) return false;
        return true;
      });
      const pageNum = Number(query['pageNum']) || 1;
      const pageSize = Number(query['pageSize']) || 20;
      const start = (pageNum - 1) * pageSize;
      return { lists: lists.slice(start, start + pageSize), total: lists.length };
    },
  });
  protected readonly maxHeight = injectAdminTableMaxHeight(PAGE_SELECTOR, 400);
  protected readonly columns = injectFlexColumns(COLUMNS, PAGE_SELECTOR);
}
