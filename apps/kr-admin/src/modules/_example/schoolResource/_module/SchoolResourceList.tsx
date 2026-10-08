import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Empty, Input, Radio, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';

import DialogEditSchoolResource from './DialogEditSchoolResource';

import CellDateTime from '@/components/CellDateTime';
import CellNameId from '@/components/CellNameId';
import CellState from '@/components/CellState';
import DoFilterPanel from '@/components/DoFilterPanel';
import { createSelectColumn } from '@/components/DoSelectCell';
import ListPaginationBar from '@/components/ListPaginationBar';
import TableWrap from '@/components/TableWrap';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { useRowSelector } from '@/composables/useRowSelector';
import { useTableQuery } from '@/composables/useTableQuery';
import maps from '@/maps';
import {
  requestBatchSwitchSchoolResource,
  requestDeleteSchoolResource,
  requestSchoolResourcePage,
  type SchoolResourceRow,
} from '@/modules/_example/schoolResource/_api';
import {
  SCHOOL_STATUS_DISABLED,
  SCHOOL_STATUS_ENABLED,
} from '@/modules/_example/schoolResource/_map/schoolStatus';
import { message, modal } from '@/plugins/antdApp';

export type SchoolResourceListProps = {
  enableSelector?: boolean;
  isMultiple?: boolean;
  inDialog?: boolean;
  /** 选择器模式回显的已选行 */
  checkedRows?: SchoolResourceRow[];
  lockEnabledStatus?: boolean;
  defaultPageSize?: number;
  onChange?: (row: SchoolResourceRow | SchoolResourceRow[] | undefined) => void;
  onLoaded?: () => void;
  onLoadFailed?: () => void;
};

export default function SchoolResourceList({
  enableSelector = false,
  isMultiple = true,
  inDialog = false,
  checkedRows,
  lockEnabledStatus = false,
  defaultPageSize,
  onChange,
  onLoaded,
  onLoadFailed,
}: SchoolResourceListProps) {
  const status = maps.example.schoolResource.schoolStatus;
  const statusFilterLocked = enableSelector && lockEnabledStatus;
  const pageClass = inDialog ? 'page-school-resource-list in-dialog' : 'page-school-resource-list';
  const resolvedDefaultPageSize = defaultPageSize ?? 10;
  const pageSizeOptions =
    inDialog && defaultPageSize === 5 ? ['5', '10', '20'] : ['10', '20', '50'];

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<SchoolResourceRow | null>(null);
  const [batchEnableLoading, setBatchEnableLoading] = useState(false);
  const [batchDisableLoading, setBatchDisableLoading] = useState(false);
  const [statusSwitchingIds, setStatusSwitchingIds] = useState<Record<string, boolean>>({});

  const {
    listFilters,
    setListFilters,
    tableData,
    tableTotal,
    tableLoading,
    tableLoadFailed,
    search,
    reset,
    patchRow,
    handlePageChange,
    handleSizeChange,
  } = useTableQuery<SchoolResourceRow, { schoolName: string; status: number | '' }>({
    defaultFilters: {
      schoolName: '',
      status: statusFilterLocked ? SCHOOL_STATUS_ENABLED : '',
    },
    defaultPageSize: resolvedDefaultPageSize,
    immediate: !enableSelector,
    fetcher: async (query, signal) =>
      requestSchoolResourcePage(query, signal) as Promise<{
        data: { lists: SchoolResourceRow[]; total: number };
      }>,
    transformQuery: (q) => {
      if (statusFilterLocked) q.status = SCHOOL_STATUS_ENABLED;
      return q;
    },
    onLoaded: () => onLoaded?.(),
    onError: () => onLoadFailed?.(),
  });

  const selector = useRowSelector<SchoolResourceRow>({
    tableData,
    lineKey: 'id',
    isMultiple,
    initialSelected: checkedRows,
    onChange: enableSelector ? onChange : undefined,
  });
  const { selectRows, chooseRow, clearSelection } = selector;

  useEffect(() => {
    if (enableSelector) void search(true);
  }, [enableSelector]);

  const maxHeight = useAdminTableMaxHeight(
    inDialog ? '.page-school-resource-list.in-dialog' : '.page-school-resource-list',
    inDialog ? 360 : 400,
  );

  function handleReset() {
    void reset({
      schoolName: '',
      status: statusFilterLocked ? SCHOOL_STATUS_ENABLED : '',
    });
  }

  async function toBatchSwitch(nextStatus: number) {
    const ids = selectRows.map((row) => row.id);
    if (!ids.length) return;
    const actionLabel = nextStatus === SCHOOL_STATUS_ENABLED ? '启用' : '停用';
    modal.confirm({
      title: '提示',
      content: `确定${actionLabel}所选的 ${ids.length} 所学校？`,
      onOk: async () => {
        const setLoading =
          nextStatus === SCHOOL_STATUS_ENABLED ? setBatchEnableLoading : setBatchDisableLoading;
        setLoading(true);
        try {
          await requestBatchSwitchSchoolResource(ids, nextStatus);
          message.success(`${actionLabel}成功`);
          clearSelection();
          void search(false);
        } finally {
          setLoading(false);
        }
      },
    });
  }

  async function switchSchoolStatus(row: SchoolResourceRow, nextStatus: string | number | boolean) {
    const key = row.id;
    setStatusSwitchingIds((prev) => ({ ...prev, [key]: true }));
    try {
      await requestBatchSwitchSchoolResource([row.id], Number(nextStatus));
      patchRow((item) => item.id === row.id, { status: Number(nextStatus) });
      message.success(Number(nextStatus) === SCHOOL_STATUS_ENABLED ? '已启用' : '已停用');
    } finally {
      setStatusSwitchingIds((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  const columns: ColumnsType<SchoolResourceRow> = [
    createSelectColumn(selector, { multiple: isMultiple }),
    {
      title: '学校名称',
      dataIndex: 'schoolName',
      minWidth: 160,
      className: 'name-slot-cell',
      render: (_, row) => (
        <CellNameId
          id={row.id}
          name={row.schoolName}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (_, row) => (
        <CellState
          modelValue={row.status}
          activeValue={SCHOOL_STATUS_ENABLED}
          inactiveValue={SCHOOL_STATUS_DISABLED}
          activeLabel={status.getLabel(SCHOOL_STATUS_ENABLED)}
          inactiveLabel={status.getLabel(SCHOOL_STATUS_DISABLED)}
          switchable={!enableSelector}
          switching={!!statusSwitchingIds[row.id]}
          activeTips="确认启用该学校？"
          inactiveTips="确认停用该学校？"
          onSwitch={(next) => void switchSchoolStatus(row, next)}
        />
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      minWidth: 140,
      ellipsis: true,
      render: (v) => v || '—',
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
          新建学校
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
                content: `确认删除「${row.schoolName}」？`,
                onOk: async () => {
                  await requestDeleteSchoolResource({ id: row.id });
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

  return (
    <div className={pageClass}>
      <DoFilterPanel
        labelWidth={80}
        line={1}
        loading={tableLoading}
        onSearch={() => void search(true)}
        ctl={
          !statusFilterLocked ? (
            <Button
              disabled={tableLoading}
              onClick={handleReset}
            >
              重置
            </Button>
          ) : null
        }
      >
        <div className="do-filter-field">
          <span className="do-filter-field-label">学校名称</span>
          <Input
            allowClear
            placeholder="不限"
            value={listFilters.schoolName}
            onChange={(e) => setListFilters({ schoolName: e.target.value })}
            onPressEnter={() => void search(true)}
          />
        </div>
        <div className="do-filter-field">
          <span className="do-filter-field-label do-filter-field-label-sm">状态</span>
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            size="small"
            disabled={statusFilterLocked}
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
        className={inDialog ? 'drawer-pick-table-wrap' : undefined}
        enableDoHeader={!enableSelector}
        batch={
          !enableSelector ? (
            <div className="batch-control">
              <span>批量操作：</span>
              <Button
                className="ml-5"
                color="green"
                variant="outlined"
                size="small"
                disabled={!selectRows.length}
                loading={batchEnableLoading}
                onClick={() => void toBatchSwitch(SCHOOL_STATUS_ENABLED)}
              >
                批量启用
              </Button>
              <Button
                className="ml-5"
                color="orange"
                variant="outlined"
                size="small"
                disabled={!selectRows.length}
                loading={batchDisableLoading}
                onClick={() => void toBatchSwitch(SCHOOL_STATUS_DISABLED)}
              >
                批量停用
              </Button>
            </div>
          ) : null
        }
        footer={
          <ListPaginationBar
            pageNum={listFilters.pageNum || 1}
            pageSize={listFilters.pageSize || resolvedDefaultPageSize}
            total={tableTotal}
            loading={tableLoading}
            pageSizeOptions={pageSizeOptions}
            onPageChange={(p) => void handlePageChange(p)}
            onSizeChange={(size) => void handleSizeChange(size)}
            onRefresh={() => void search(false)}
          />
        }
      >
        <Table
          className={[
            'do-inner-scroller',
            'page-table',
            inDialog ? 'school-resource-pick-table' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          rowKey="id"
          loading={tableLoading}
          dataSource={tableData}
          columns={columns}
          pagination={false}
          size="middle"
          scroll={{ y: maxHeight }}
          locale={{
            emptyText: tableLoadFailed ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="列表加载失败"
              >
                <Button
                  type="primary"
                  ghost
                  size="small"
                  onClick={() => void search(false)}
                >
                  重试
                </Button>
              </Empty>
            ) : tableLoading ? null : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无数据"
              />
            ),
          }}
          rowClassName={(row) =>
            enableSelector && !isMultiple && selector.isRowSelected(row) ? 'current-row' : ''
          }
          onRow={(row) => ({
            onClick: () => {
              if (enableSelector) chooseRow(row);
            },
          })}
        />
      </TableWrap>

      <DialogEditSchoolResource
        open={editOpen}
        row={editRow}
        onClose={() => setEditOpen(false)}
        onSuccess={() => void search(false)}
      />
    </div>
  );
}
