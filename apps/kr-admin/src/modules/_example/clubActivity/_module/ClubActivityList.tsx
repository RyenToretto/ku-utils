import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Input, Radio, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useRef, useState } from 'react';

import DialogEditClubActivity from './DialogEditClubActivity';

import CellDateTime from '@/components/CellDateTime';
import CellNameId from '@/components/CellNameId';
import CellState from '@/components/CellState';
import DoFilterPanel from '@/components/DoFilterPanel';
import { DoSelectBatchBox, createSelectColumn } from '@/components/DoSelectCell';
import ListPaginationBar from '@/components/ListPaginationBar';
import TableWrap from '@/components/TableWrap';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { useFlexColumns } from '@/composables/useFlexColumns';
import { useRowSelector } from '@/composables/useRowSelector';
import { useTableQuery } from '@/composables/useTableQuery';
import maps from '@/maps';
import {
  requestBatchSwitchClubActivity,
  requestDeleteClubActivity,
  requestClubActivityList,
  type ClubActivityRow,
} from '@/modules/_example/clubActivity/_api';
import {
  CLUB_STATUS_DISABLED,
  CLUB_STATUS_ENABLED,
} from '@/modules/_example/clubActivity/_map/clubStatus';
import { message, modal } from '@/plugins/antdApp';

export default function ClubActivityList() {
  const status = maps.example.clubActivity.clubStatus;
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<ClubActivityRow | null>(null);
  const [batchEnableLoading, setBatchEnableLoading] = useState(false);
  const [batchDisableLoading, setBatchDisableLoading] = useState(false);
  const [statusSwitchingIds, setStatusSwitchingIds] = useState<Record<string, boolean>>({});
  const clearSelectionRef = useRef<() => void>(() => {});

  const {
    listFilters,
    setListFilters,
    tableData,
    tableTotal,
    tableLoading,
    search,
    reset,
    patchRow,
    handlePageChange,
    handleSizeChange,
  } = useTableQuery<ClubActivityRow, { clubName: string; status: number | '' }>({
    defaultFilters: { clubName: '', status: '' },
    defaultPageSize: 10,
    fetcher: async (query, signal) =>
      requestClubActivityList(query, signal) as Promise<{
        data: { lists: ClubActivityRow[]; total: number };
      }>,
    onLoaded: () => clearSelectionRef.current(),
  });
  const selector = useRowSelector<ClubActivityRow>({ tableData, lineKey: 'id', isMultiple: true });
  const { selectRows, statusOfSelect, toggleBatchSelect, clearSelection } = selector;
  clearSelectionRef.current = clearSelection;
  const maxHeight = useAdminTableMaxHeight('.page-club-activity', 400);

  async function toBatchSwitch(nextStatus: number) {
    const ids = selectRows.map((row) => row.id);
    if (!ids.length) return;
    const actionLabel = nextStatus === CLUB_STATUS_ENABLED ? '启用' : '停用';
    modal.confirm({
      title: '提示',
      content: `确定${actionLabel}所选的 ${ids.length} 个社团？`,
      onOk: async () => {
        const setLoading =
          nextStatus === CLUB_STATUS_ENABLED ? setBatchEnableLoading : setBatchDisableLoading;
        setLoading(true);
        try {
          await requestBatchSwitchClubActivity(ids, nextStatus);
          message.success(`${actionLabel}成功`);
          clearSelection();
          void search(false);
        } finally {
          setLoading(false);
        }
      },
    });
  }

  async function switchClubStatus(row: ClubActivityRow, nextStatus: string | number | boolean) {
    const key = String(row.id);
    setStatusSwitchingIds((prev) => ({ ...prev, [key]: true }));
    try {
      await requestBatchSwitchClubActivity([row.id], Number(nextStatus));
      patchRow((item) => item.id === row.id, { status: Number(nextStatus) });
      message.success(Number(nextStatus) === CLUB_STATUS_ENABLED ? '已启用' : '已停用');
    } finally {
      setStatusSwitchingIds((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  const columns: ColumnsType<ClubActivityRow> = [
    createSelectColumn(selector, { batchHeader: false }),
    {
      title: '社团名称',
      dataIndex: 'clubName',
      minWidth: 140,
      className: 'name-slot-cell',
      render: (_, row) => (
        <CellNameId
          id={row.id}
          name={row.clubName}
        />
      ),
    },
    {
      title: '参与学校',
      dataIndex: 'schools',
      minWidth: 220,
      render: (schools: ClubActivityRow['schools']) =>
        schools?.length
          ? schools.map((s) => (
              <Tag
                key={s.id}
                className="school-chip"
              >
                {s.schoolName}
              </Tag>
            ))
          : '—',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (_, row) => (
        <CellState
          modelValue={row.status}
          activeValue={CLUB_STATUS_ENABLED}
          inactiveValue={CLUB_STATUS_DISABLED}
          activeLabel={status.getLabel(CLUB_STATUS_ENABLED)}
          inactiveLabel={status.getLabel(CLUB_STATUS_DISABLED)}
          switchable
          switching={!!statusSwitchingIds[String(row.id)]}
          activeTips="确认启用该社团？"
          inactiveTips="确认停用该社团？"
          onSwitch={(next) => void switchClubStatus(row, next)}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      minWidth: 160,
      render: (v) => <CellDateTime value={v} />,
    },
    {
      title: (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            setEditRow(null);
            setEditOpen(true);
          }}
        >
          新建社团
        </Button>
      ),
      key: 'ops',
      width: 140,
      fixed: 'right',
      className: 'ops-column',
      render: (_, row) => (
        <div className="line-actions">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EditOutlined />}
            title="编辑"
            aria-label="编辑"
            onClick={(e) => {
              e.stopPropagation();
              setEditRow(row);
              setEditOpen(true);
            }}
          />
          <Button
            danger
            ghost
            size="small"
            icon={<DeleteOutlined />}
            title="删除"
            aria-label="删除"
            onClick={(e) => {
              e.stopPropagation();
              modal.confirm({
                title: '提示',
                content: `确认删除「${row.clubName}」？`,
                onOk: async () => {
                  await requestDeleteClubActivity({ id: row.id });
                  message.success('删除成功');
                  void search(false);
                },
              });
            }}
          />
        </div>
      ),
    },
  ];

  const flexColumns = useFlexColumns(columns, '.page-club-activity');

  return (
    <div className="page-club-activity">
      <DoFilterPanel
        labelWidth={80}
        line={1}
        loading={tableLoading}
        onSearch={() => void search(true)}
        ctl={
          <Button
            disabled={tableLoading}
            onClick={() => void reset()}
          >
            重置
          </Button>
        }
      >
        <div className="do-filter-field">
          <span className="do-filter-field-label">社团名称</span>
          <Input
            allowClear
            placeholder="不限"
            value={listFilters.clubName}
            onChange={(e) => setListFilters({ clubName: e.target.value })}
            onPressEnter={() => void search(true)}
          />
        </div>
        <div className="do-filter-field">
          <span className="do-filter-field-label do-filter-field-label-sm">状态</span>
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            size="small"
            value={listFilters.status}
            onChange={(e) => {
              setListFilters({ status: e.target.value });
              void search(true);
            }}
            options={[{ label: '不限', value: '' }, ...status.options]}
          />
        </div>
      </DoFilterPanel>
      <TableWrap
        enableDoHeader
        batch={
          <div className="batch-control">
            <div
              className={[
                'batch-select-control',
                statusOfSelect !== 'none-selected' ? 'is-active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              role="checkbox"
              aria-checked={
                statusOfSelect === 'all-selected'
                  ? 'true'
                  : statusOfSelect === 'half-selected'
                    ? 'mixed'
                    : 'false'
              }
              tabIndex={0}
              onClick={toggleBatchSelect}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleBatchSelect();
                }
              }}
            >
              <DoSelectBatchBox status={statusOfSelect} />
              <span className="batch-select-label">全选本页</span>
            </div>
            <span>批量操作：</span>
            <Button
              color="green"
              variant="outlined"
              size="small"
              disabled={!selectRows.length}
              loading={batchEnableLoading}
              onClick={() => void toBatchSwitch(CLUB_STATUS_ENABLED)}
            >
              批量启用
            </Button>
            <Button
              color="orange"
              variant="outlined"
              size="small"
              disabled={!selectRows.length}
              loading={batchDisableLoading}
              onClick={() => void toBatchSwitch(CLUB_STATUS_DISABLED)}
            >
              批量停用
            </Button>
          </div>
        }
        footer={
          <ListPaginationBar
            pageNum={listFilters.pageNum || 1}
            pageSize={listFilters.pageSize || 10}
            total={tableTotal}
            loading={tableLoading}
            onPageChange={(p) => void handlePageChange(p)}
            onSizeChange={(s) => void handleSizeChange(s)}
            onRefresh={() => void search(false)}
          />
        }
      >
        <Table
          className="do-inner-scroller page-table"
          rowKey="id"
          loading={tableLoading}
          dataSource={tableData}
          columns={flexColumns}
          pagination={false}
          size="middle"
          scroll={{ y: maxHeight }}
        />
      </TableWrap>
      <DialogEditClubActivity
        open={editOpen}
        row={editRow}
        onClose={() => setEditOpen(false)}
        onSuccess={() => void search(false)}
      />
    </div>
  );
}
