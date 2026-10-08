import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { DialogEditClubActivity } from './dialog-edit-club-activity';

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
import { ClubActivityApi, type ClubActivityRow } from '@/modules/_example/clubActivity/_api';
import {
  CLUB_STATUS_DISABLED,
  CLUB_STATUS_ENABLED,
} from '@/modules/_example/clubActivity/_map/club-status';
import { injectConfirm } from '@/plugins/confirm';

const PAGE_SELECTOR = '.page-club-activity';

const COLUMNS = [
  { key: 'select', width: 55 },
  { key: 'clubName', minWidth: 140 },
  { key: 'schools', minWidth: 220 },
  { key: 'status', width: 100 },
  { key: 'createTime', minWidth: 160 },
  { key: 'ops', width: 140 },
];

@Component({
  selector: 'ka-club-activity-list',
  imports: [
    CellDateTime,
    CellNameId,
    CellState,
    DialogEditClubActivity,
    DoFilterPanel,
    DoSelectBatchBox,
    DoSelectCell,
    FormsModule,
    ListPaginationBar,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzRadioModule,
    NzTableModule,
    NzTagModule,
    TableWrap,
    TableWrapFooter,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-club-activity' },
  template: `
    <ka-do-filter-panel
      [labelWidth]="80"
      [line]="1"
      [loading]="query.tableLoading()"
      (searchClick)="query.search(true)"
    >
      <div class="do-filter-field">
        <span class="do-filter-field-label">社团名称</span>
        <nz-input-wrapper nzAllowClear>
          <input
            nz-input
            placeholder="不限"
            [ngModel]="query.filters().clubName"
            (ngModelChange)="query.setListFilters({ clubName: $event ?? '' })"
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
        class="batch-control"
      >
        <div
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
        </div>
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
            <th>社团名称</th>
            <th>参与学校</th>
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
                新建社团
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          @for (row of table.data; track row.id) {
            <tr>
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
              <td class="name-slot-cell">
                <ka-cell-name-id
                  [id]="row.id"
                  [name]="row.clubName"
                />
              </td>
              <td>
                @for (school of row.schools; track school.id) {
                  <nz-tag class="school-chip">{{ school.schoolName }}</nz-tag>
                } @empty {
                  —
                }
              </td>
              <td nzAlign="center">
                <ka-cell-state
                  [modelValue]="row.status"
                  [activeValue]="enabled"
                  [inactiveValue]="disabled"
                  [activeLabel]="statusMap.getLabel(enabled)"
                  [inactiveLabel]="statusMap.getLabel(disabled)"
                  [switchable]="true"
                  [switching]="!!statusSwitchingIds()[row.id]"
                  activeTips="确认启用该社团？"
                  inactiveTips="确认停用该社团？"
                  (switchChange)="switchClubStatus(row, $event)"
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
                    (click)="$event.stopPropagation(); openEdit(row)"
                  >
                    <nz-icon nzType="edit" />
                  </button>
                  <button
                    nz-button
                    class="btn-plain-danger"
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
        [enableRefresh]="true"
        (pageChange)="query.handlePageChange($event)"
        (sizeChange)="query.handleSizeChange($event)"
        (refresh)="query.search(false)"
      />
    </ka-table-wrap>

    <ka-dialog-edit-club-activity
      [open]="editOpen()"
      [row]="editRow()"
      (closed)="editOpen.set(false)"
      (success)="query.search(false)"
    />
  `,
})
export class ClubActivityList {
  private readonly api = inject(ClubActivityApi);
  private readonly message = inject(NzMessageService);
  private readonly confirm = injectConfirm();
  protected readonly statusMap = maps.example.clubActivity.clubStatus;
  protected readonly enabled = CLUB_STATUS_ENABLED;
  protected readonly disabled = CLUB_STATUS_DISABLED;

  protected readonly editOpen = signal(false);
  protected readonly editRow = signal<ClubActivityRow | null>(null);
  protected readonly batchEnableLoading = signal(false);
  protected readonly batchDisableLoading = signal(false);
  protected readonly statusSwitchingIds = signal<Record<string, boolean>>({});

  protected readonly query = injectTableQuery<
    ClubActivityRow,
    { clubName: string; status: number | '' }
  >({
    defaultFilters: { clubName: '', status: '' },
    defaultPageSize: 10,
    fetcher: (query, signal) => this.api.requestClubActivityList(query, signal),
    onLoaded: () => this.selector.clearSelection(),
  });
  protected readonly selector = injectRowSelector<ClubActivityRow>({
    tableData: this.query.tableData,
    lineKey: 'id',
    isMultiple: true,
  });
  protected readonly maxHeight = injectAdminTableMaxHeight(PAGE_SELECTOR, 400);
  protected readonly columns = injectFlexColumns(COLUMNS, PAGE_SELECTOR);

  protected readonly ariaChecked = computed(() => {
    const status = this.selector.statusOfSelect();
    if (status === 'all-selected') return 'true';
    return status === 'half-selected' ? 'mixed' : 'false';
  });

  protected openEdit(row: ClubActivityRow | null) {
    this.editRow.set(row);
    this.editOpen.set(true);
  }

  protected toBatchSwitch(nextStatus: number) {
    const ids = this.selector.selectRows().map((row) => row.id);
    if (!ids.length) return;
    const actionLabel = nextStatus === CLUB_STATUS_ENABLED ? '启用' : '停用';
    const setLoading =
      nextStatus === CLUB_STATUS_ENABLED ? this.batchEnableLoading : this.batchDisableLoading;
    this.confirm({
      content: `确定${actionLabel}所选的 ${ids.length} 个社团？`,
      onOk: async () => {
        setLoading.set(true);
        try {
          await this.api.requestBatchSwitchClubActivity(ids, nextStatus);
          this.message.success(`${actionLabel}成功`);
          this.selector.clearSelection();
          void this.query.search(false);
        } finally {
          setLoading.set(false);
        }
      },
    });
  }

  protected confirmDelete(row: ClubActivityRow) {
    this.confirm({
      content: `确认删除「${row.clubName}」？`,
      onOk: async () => {
        await this.api.requestDeleteClubActivity({ id: row.id });
        this.message.success('删除成功');
        void this.query.search(false);
      },
    });
  }

  protected async switchClubStatus(row: ClubActivityRow, nextStatus: string | number | boolean) {
    const key = String(row.id);
    this.statusSwitchingIds.update((prev) => ({ ...prev, [key]: true }));
    try {
      await this.api.requestBatchSwitchClubActivity([row.id], Number(nextStatus));
      this.query.patchRow((item) => item.id === row.id, { status: Number(nextStatus) });
      this.message.success(Number(nextStatus) === CLUB_STATUS_ENABLED ? '已启用' : '已停用');
    } finally {
      this.statusSwitchingIds.update((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }
}
