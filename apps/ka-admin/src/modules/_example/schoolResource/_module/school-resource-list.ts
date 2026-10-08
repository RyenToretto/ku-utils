import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
  type OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTableModule } from 'ng-zorro-antd/table';

import { DialogEditSchoolResource } from './dialog-edit-school-resource';

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
import { SchoolResourceApi, type SchoolResourceRow } from '@/modules/_example/schoolResource/_api';
import {
  SCHOOL_STATUS_DISABLED,
  SCHOOL_STATUS_ENABLED,
} from '@/modules/_example/schoolResource/_map/school-status';
import { injectConfirm } from '@/plugins/confirm';

type SchoolResourceFilters = { schoolName: string; status: number | '' };

/** 同一时刻只会有一个学校列表实例（页面或选择抽屉），按页面类名定位即可 */
const PAGE_SELECTOR = '.page-school-resource-list';

const COLUMNS = [
  { key: 'select', width: 55 },
  { key: 'schoolName', minWidth: 160 },
  { key: 'status', width: 100 },
  { key: 'remark', minWidth: 140 },
  { key: 'createTime', minWidth: 160 },
  { key: 'ops', width: 140 },
];

@Component({
  selector: 'ka-school-resource-list',
  imports: [
    CellDateTime,
    CellNameId,
    CellState,
    DialogEditSchoolResource,
    DoFilterPanel,
    DoSelectBatchBox,
    DoSelectCell,
    FormsModule,
    ListPaginationBar,
    NzButtonModule,
    NzEmptyModule,
    NzIconModule,
    NzInputModule,
    NzRadioModule,
    NzTableModule,
    TableWrap,
    TableWrapFooter,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'page-school-resource-list',
    '[class.in-dialog]': 'inDialog()',
  },
  template: `
    <ka-do-filter-panel
      [labelWidth]="80"
      [line]="1"
      [loading]="query.tableLoading()"
      (searchClick)="query.search(true)"
    >
      <div class="do-filter-field">
        <span class="do-filter-field-label">学校名称</span>
        <nz-input-wrapper nzAllowClear>
          <input
            nz-input
            placeholder="不限"
            [ngModel]="query.filters().schoolName"
            (ngModelChange)="query.setListFilters({ schoolName: $event ?? '' })"
            (keydown.enter)="query.search(true)"
          />
        </nz-input-wrapper>
      </div>
      <div class="do-filter-field">
        <span class="do-filter-field-label do-filter-field-label-sm">状态</span>
        <nz-radio-group
          nzButtonStyle="solid"
          nzSize="small"
          [nzDisabled]="statusFilterLocked()"
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
      @if (!statusFilterLocked()) {
        <button
          filterCtl
          nz-button
          [disabled]="query.tableLoading()"
          (click)="handleReset()"
        >
          重置
        </button>
      }
    </ka-do-filter-panel>

    <ka-table-wrap
      [class.drawer-pick-table-wrap]="inDialog()"
      [enableDoHeader]="!enableSelector()"
    >
      @if (!enableSelector()) {
        <div
          tableBatch
          class="batch-control"
        >
          <span>批量操作：</span>
          <button
            nz-button
            nzSize="small"
            class="btn-plain-success"
            [disabled]="!selector.selectRows().length"
            [nzLoading]="batchEnableLoading()"
            (click)="toBatchSwitch(enabled)"
          >
            批量启用
          </button>
          <button
            nz-button
            nzSize="small"
            class="btn-plain-warning"
            [disabled]="!selector.selectRows().length"
            [nzLoading]="batchDisableLoading()"
            (click)="toBatchSwitch(disabled)"
          >
            批量停用
          </button>
        </div>
      }

      <nz-table
        #table
        class="do-inner-scroller page-table"
        nzSize="middle"
        [class.school-resource-pick-table]="inDialog()"
        [nzData]="query.tableData()"
        [nzLoading]="query.tableLoading()"
        [nzFrontPagination]="false"
        [nzShowPagination]="false"
        [nzNoResult]="emptyTpl"
        [nzScroll]="{ y: maxHeight() + 'px' }"
        [nzWidthConfig]="columns.widthConfig()"
      >
        <thead>
          <tr>
            <th
              nzLeft
              nzAlign="center"
            >
              @if (isMultiple()) {
                <ka-do-select-batch-box
                  [status]="selector.statusOfSelect()"
                  (click)="$event.stopPropagation(); selector.toggleBatchSelect()"
                />
              }
            </th>
            <th>学校名称</th>
            <th nzAlign="center">状态</th>
            <th>备注</th>
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
                新建学校
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          @for (row of table.data; track row.id) {
            <tr
              [class.current-row]="enableSelector() && !isMultiple() && selector.isRowSelected(row)"
              (click)="enableSelector() && selector.chooseRow(row)"
            >
              <td
                nzLeft
                nzAlign="center"
              >
                <ka-do-select-cell
                  [active]="selector.isRowSelected(row)"
                  [single]="!isMultiple()"
                  [transparent]="selector.isRowTransparent(row)"
                  (choose)="selector.chooseRow(row)"
                />
              </td>
              <td class="name-slot-cell">
                <ka-cell-name-id
                  [id]="row.id"
                  [name]="row.schoolName"
                />
              </td>
              <td nzAlign="center">
                <ka-cell-state
                  [modelValue]="row.status"
                  [activeValue]="enabled"
                  [inactiveValue]="disabled"
                  [activeLabel]="statusMap.getLabel(enabled)"
                  [inactiveLabel]="statusMap.getLabel(disabled)"
                  [switchable]="!enableSelector()"
                  [switching]="!!statusSwitchingIds()[row.id]"
                  activeTips="确认启用该学校？"
                  inactiveTips="确认停用该学校？"
                  (switchChange)="switchSchoolStatus(row, $event)"
                />
              </td>
              <td nzEllipsis>{{ row.remark || '—' }}</td>
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
                    (click)="$event.stopPropagation(); openEdit(row)"
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
                    (click)="$event.stopPropagation(); confirmDelete(row)"
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
        [pageSizeOptions]="pageSizeOptions()"
        [enableRefresh]="true"
        (pageChange)="query.handlePageChange($event)"
        (sizeChange)="query.handleSizeChange($event)"
        (refresh)="query.search(false)"
      />
    </ka-table-wrap>

    <ng-template #emptyTpl>
      @if (query.tableLoadFailed()) {
        <nz-empty
          nzNotFoundImage="simple"
          nzNotFoundContent="列表加载失败"
          [nzNotFoundFooter]="retryTpl"
        />
      } @else if (!query.tableLoading()) {
        <nz-empty
          nzNotFoundImage="simple"
          nzNotFoundContent="暂无数据"
        />
      }
    </ng-template>
    <ng-template #retryTpl>
      <button
        nz-button
        nzType="primary"
        nzGhost
        nzSize="small"
        (click)="query.search(false)"
      >
        重试
      </button>
    </ng-template>

    <ka-dialog-edit-school-resource
      [open]="editOpen()"
      [row]="editRow()"
      (closed)="editOpen.set(false)"
      (success)="query.search(false)"
    />
  `,
})
export class SchoolResourceList implements OnInit {
  readonly enableSelector = input(false);
  readonly isMultiple = input(true);
  readonly inDialog = input(false);
  /** 选择器模式回显的已选行 */
  readonly checkedRows = input<SchoolResourceRow[]>([]);
  readonly lockEnabledStatus = input(false);
  readonly defaultPageSize = input<number>();
  readonly selectionChange = output<SchoolResourceRow | SchoolResourceRow[] | undefined>();
  readonly loaded = output<void>();
  readonly loadFailed = output<void>();

  private readonly api = inject(SchoolResourceApi);
  private readonly message = inject(NzMessageService);
  private readonly confirm = injectConfirm();
  protected readonly statusMap = maps.example.schoolResource.schoolStatus;
  protected readonly enabled = SCHOOL_STATUS_ENABLED;
  protected readonly disabled = SCHOOL_STATUS_DISABLED;

  protected readonly statusFilterLocked = computed(
    () => this.enableSelector() && this.lockEnabledStatus(),
  );
  protected readonly pageSizeOptions = computed(() =>
    this.inDialog() && this.defaultPageSize() === 5 ? [5, 10, 20] : [10, 20, 50],
  );

  protected readonly editOpen = signal(false);
  protected readonly editRow = signal<SchoolResourceRow | null>(null);
  protected readonly batchEnableLoading = signal(false);
  protected readonly batchDisableLoading = signal(false);
  protected readonly statusSwitchingIds = signal<Record<string, boolean>>({});

  protected readonly query = injectTableQuery<SchoolResourceRow, SchoolResourceFilters>({
    defaultFilters: { schoolName: '', status: '' },
    defaultPageSize: 10,
    immediate: false,
    fetcher: (query, signal) => this.api.requestSchoolResourcePage(query, signal),
    transformQuery: (q) => {
      if (this.statusFilterLocked()) q['status'] = SCHOOL_STATUS_ENABLED;
      return q;
    },
    onLoaded: () => this.loaded.emit(),
    onError: () => this.loadFailed.emit(),
  });
  protected readonly selector = injectRowSelector<SchoolResourceRow>({
    tableData: this.query.tableData,
    lineKey: 'id',
    isMultiple: this.isMultiple,
    onChange: (value) => {
      if (this.enableSelector()) this.selectionChange.emit(value);
    },
  });
  protected readonly maxHeight = injectAdminTableMaxHeight(PAGE_SELECTOR, 400);
  protected readonly columns = injectFlexColumns(COLUMNS, PAGE_SELECTOR);

  ngOnInit() {
    const rows = this.checkedRows();
    if (rows.length) {
      this.selector.setChecked(
        rows.map((row) => row.id),
        rows,
        true,
      );
    }
    void this.query.reset(this.initialFilters(), this.defaultPageSize());
  }

  private initialFilters(): SchoolResourceFilters {
    return {
      schoolName: '',
      status: this.statusFilterLocked() ? SCHOOL_STATUS_ENABLED : '',
    };
  }

  protected handleReset() {
    void this.query.reset(this.initialFilters());
  }

  protected openEdit(row: SchoolResourceRow | null) {
    this.editRow.set(row);
    this.editOpen.set(true);
  }

  protected toBatchSwitch(nextStatus: number) {
    const ids = this.selector.selectRows().map((row) => row.id);
    if (!ids.length) return;
    const actionLabel = nextStatus === SCHOOL_STATUS_ENABLED ? '启用' : '停用';
    const setLoading =
      nextStatus === SCHOOL_STATUS_ENABLED ? this.batchEnableLoading : this.batchDisableLoading;
    this.confirm({
      content: `确定${actionLabel}所选的 ${ids.length} 所学校？`,
      onOk: async () => {
        setLoading.set(true);
        try {
          await this.api.requestBatchSwitchSchoolResource(ids, nextStatus);
          this.message.success(`${actionLabel}成功`);
          this.selector.clearSelection();
          void this.query.search(false);
        } finally {
          setLoading.set(false);
        }
      },
    });
  }

  protected confirmDelete(row: SchoolResourceRow) {
    this.confirm({
      content: `确认删除「${row.schoolName}」？`,
      onOk: async () => {
        await this.api.requestDeleteSchoolResource({ id: row.id });
        this.message.success('删除成功');
        void this.query.search(false);
      },
    });
  }

  protected async switchSchoolStatus(
    row: SchoolResourceRow,
    nextStatus: string | number | boolean,
  ) {
    const key = row.id;
    this.statusSwitchingIds.update((prev) => ({ ...prev, [key]: true }));
    try {
      await this.api.requestBatchSwitchSchoolResource([row.id], Number(nextStatus));
      this.query.patchRow((item) => item.id === row.id, { status: Number(nextStatus) });
      this.message.success(Number(nextStatus) === SCHOOL_STATUS_ENABLED ? '已启用' : '已停用');
    } finally {
      this.statusSwitchingIds.update((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }
}
