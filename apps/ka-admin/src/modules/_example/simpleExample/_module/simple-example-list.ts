import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { DialogEditSimpleExample } from './dialog-edit-simple-example';

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
import {
  buildDoFilterPanelDemoFields,
  createDoFilterPanelDemoFilters,
} from '@/modules/_example/doFilterPanel/_utils/do-filter-panel-demo';
import { SimpleExampleApi, type SimpleExampleRow } from '@/modules/_example/simpleExample/_api';
import { injectConfirm } from '@/plugins/confirm';

type SimpleExampleFilters = { exampleName: string; status: number | ''; taskAction: string };

const DEMO_OPTIONS = [
  { label: '不限', value: '' },
  { label: '启用', value: '1' },
  { label: '停用', value: '0' },
];

const COLUMNS = [
  { key: 'exampleName', minWidth: 160 },
  { key: 'pkg', minWidth: 160 },
  { key: 'taskAction', width: 100 },
  { key: 'status', width: 100 },
  { key: 'createTime', minWidth: 160 },
  { key: 'ops', width: 140 },
];

@Component({
  selector: 'ka-simple-example-list',
  imports: [
    CellDateTime,
    CellNameId,
    CellState,
    DialogEditSimpleExample,
    DoFilterPanel,
    FormsModule,
    ListPaginationBar,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzRadioModule,
    NzSelectModule,
    NzTableModule,
    TableWrap,
    TableWrapFooter,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'page-simple-example-list',
    '[class.fill-viewport]': 'fillViewportLayout()',
  },
  template: `
    <ka-do-filter-panel
      [line]="filterLine() ?? 1"
      [labelWidth]="isFilterPanelDemo() ? 'auto' : 80"
      [loading]="query.tableLoading()"
      [hideSearch]="filterButtonCount() < 1"
      (searchClick)="query.search(true)"
    >
      @if (isFilterPanelDemo()) {
        @for (field of demoFields(); track field.key) {
          <div class="do-filter-field">
            <span class="do-filter-field-label">筛选项 {{ field.key.slice(1) }}</span>
            @switch (field.kind) {
              @case ('input') {
                <nz-input-wrapper nzAllowClear>
                  <input
                    nz-input
                    placeholder="不限"
                    [ngModel]="demoFilters()[field.key] ?? ''"
                    (ngModelChange)="patchDemoFilter(field.key, $event)"
                    (keydown.enter)="query.search(true)"
                  />
                </nz-input-wrapper>
              }
              @case ('select') {
                <nz-select
                  nzAllowClear
                  nzPlaceHolder="不限"
                  [nzOptions]="demoOptions"
                  [ngModel]="demoFilters()[field.key] ?? ''"
                  (ngModelChange)="patchDemoFilter(field.key, $event)"
                />
              }
              @case ('radio') {
                <nz-radio-group
                  nzButtonStyle="solid"
                  nzSize="small"
                  [ngModel]="demoFilters()[field.key] ?? ''"
                  (ngModelChange)="patchDemoFilter(field.key, $event); query.search(true)"
                >
                  @for (option of demoOptions; track option.value) {
                    <label
                      nz-radio-button
                      [nzValue]="option.value"
                    >
                      {{ option.label }}
                    </label>
                  }
                </nz-radio-group>
              }
            }
          </div>
        }
      } @else {
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
          <span class="do-filter-field-label">任务类型</span>
          <nz-radio-group
            nzButtonStyle="solid"
            nzSize="small"
            [ngModel]="query.filters().taskAction"
            (ngModelChange)="query.setListFilters({ taskAction: $event }); query.search(true)"
          >
            <label
              nz-radio-button
              nzValue=""
            >
              不限
            </label>
            @for (option of taskMap.options; track option.value) {
              <label
                nz-radio-button
                [nzValue]="option.value"
              >
                {{ option.label }}
              </label>
            }
          </nz-radio-group>
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
      }

      @if (filterButtonCount() >= 2) {
        <ng-container filterCtl>
          <button
            nz-button
            [disabled]="query.tableLoading()"
            (click)="handleReset()"
          >
            重置
          </button>
          @if (filterButtonCount() >= 3) {
            <button
              nz-button
              [disabled]="query.tableLoading()"
              (click)="onDemoExtra('export')"
            >
              导出
            </button>
          }
          @if (filterButtonCount() >= 4) {
            <button
              nz-button
              [disabled]="query.tableLoading()"
              (click)="onDemoExtra('more')"
            >
              更多
            </button>
          }
        </ng-container>
      }
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
            <th>示例名称</th>
            <th>产品包名</th>
            <th nzAlign="center">任务类型</th>
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
                新建示例
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
                  [name]="row.exampleName"
                />
              </td>
              <td>{{ row.pkg || '—' }}</td>
              <td nzAlign="center">{{ taskMap.getLabel($any(row.taskAction)) }}</td>
              <td nzAlign="center">
                <ka-cell-state
                  [modelValue]="row.status"
                  [activeValue]="1"
                  [inactiveValue]="0"
                  [activeLabel]="statusMap.getLabel(1)"
                  [inactiveLabel]="statusMap.getLabel(0)"
                  [switchable]="true"
                  [switching]="!!statusSwitchingIds()[row.id]"
                  activeTips="确认启用该示例？"
                  inactiveTips="确认停用该示例？"
                  (switchChange)="switchExampleStatus(row, $event)"
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
                    nzType="primary"
                    nzGhost
                    nzSize="small"
                    title="编辑"
                    aria-label="编辑"
                    (click)="openEdit(row)"
                  >
                    <nz-icon nzType="edit" />
                  </button>
                  <button
                    nz-button
                    nzDanger
                    nzGhost
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
        (pageChange)="query.handlePageChange($event)"
        (sizeChange)="query.handleSizeChange($event)"
      />
    </ka-table-wrap>

    <ka-dialog-edit-simple-example
      [open]="editOpen()"
      [row]="editRow()"
      (closed)="editOpen.set(false)"
      (success)="query.search(false)"
    />
  `,
})
export class SimpleExampleList {
  readonly filterFieldCount = input<number>();
  readonly filterButtonCount = input(2);
  readonly filterLine = input<number>();
  readonly fillViewportLayout = input(false);

  private readonly api = inject(SimpleExampleApi);
  private readonly message = inject(NzMessageService);
  private readonly confirm = injectConfirm();
  protected readonly statusMap = maps.example.simpleExample.exampleStatus;
  protected readonly taskMap = maps.example.simpleExample.exampleTaskAction;
  protected readonly demoOptions = DEMO_OPTIONS;

  protected readonly isFilterPanelDemo = computed(() => (this.filterFieldCount() ?? 0) > 0);
  protected readonly demoFields = computed(() =>
    this.isFilterPanelDemo() ? buildDoFilterPanelDemoFields(this.filterFieldCount()!) : [],
  );
  protected readonly demoFilters = linkedSignal(() =>
    createDoFilterPanelDemoFilters(this.filterFieldCount() ?? 0),
  );

  protected readonly editOpen = signal(false);
  protected readonly editRow = signal<SimpleExampleRow | null>(null);
  protected readonly statusSwitchingIds = signal<Record<string, boolean>>({});

  protected readonly query = injectTableQuery<SimpleExampleRow, SimpleExampleFilters>({
    defaultFilters: { exampleName: '', status: '', taskAction: '' },
    defaultPageSize: 10,
    fetcher: (query, signal) => this.api.requestSimpleExampleList(query, signal),
  });
  protected readonly maxHeight = injectAdminTableMaxHeight('.page-simple-example-list', 400);
  protected readonly columns = injectFlexColumns(COLUMNS, '.page-simple-example-list');

  protected patchDemoFilter(key: string, value: string | null) {
    this.demoFilters.update((prev) => ({ ...prev, [key]: value ?? '' }));
  }

  protected handleReset() {
    if (this.isFilterPanelDemo()) {
      this.demoFilters.set(createDoFilterPanelDemoFilters(this.filterFieldCount()!));
      void this.query.search(true);
      return;
    }
    void this.query.reset();
  }

  protected onDemoExtra(kind: 'export' | 'more') {
    this.message.success(`已触发「${kind === 'export' ? '导出' : '更多'}」（Demo）`);
  }

  protected openEdit(row: SimpleExampleRow | null) {
    this.editRow.set(row);
    this.editOpen.set(true);
  }

  protected confirmDelete(row: SimpleExampleRow) {
    this.confirm({
      content: `确认删除「${row.exampleName}」？`,
      onOk: async () => {
        await this.api.requestDeleteSimpleExample({ id: row.id });
        this.message.success('删除成功');
        void this.query.search(false);
      },
    });
  }

  protected async switchExampleStatus(
    row: SimpleExampleRow,
    nextStatus: string | number | boolean,
  ) {
    const key = String(row.id);
    this.statusSwitchingIds.update((prev) => ({ ...prev, [key]: true }));
    try {
      await this.api.requestBatchSimpleExample([row.id], Number(nextStatus));
      this.query.patchRow((item) => item.id === row.id, { status: Number(nextStatus) });
      this.message.success(Number(nextStatus) === 1 ? '已启用' : '已停用');
    } finally {
      this.statusSwitchingIds.update((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }
}
