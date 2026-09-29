import { Button, Input, Pagination, Radio, Space, Table, message, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';

import DoFilterPanel from '@/components/DoFilterPanel';
import TableWrap from '@/components/TableWrap';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { useTableQuery } from '@/composables/useTableQuery';
import maps from '@/maps';
import {
  requestDeleteSimpleExample,
  requestSimpleExampleList,
} from '@/modules/_example/simpleExample/_api';
import DialogEditSimpleExample from '@/modules/_example/simpleExample/_module/DialogEditSimpleExample';

export type SimpleExampleRow = {
  id: string | number;
  exampleName: string;
  pkg?: string;
  taskAction?: string | number;
  status: number;
  createTime?: string;
  [key: string]: unknown;
};

export type SimpleExampleListProps = {
  filterFieldCount?: number;
  filterButtonCount?: number;
  filterLine?: number;
  fillViewportLayout?: boolean;
  enableBatchSelect?: boolean;
  pageClassName?: string;
};

export default function SimpleExampleList({
  filterFieldCount,
  filterButtonCount = 2,
  filterLine = 2,
  fillViewportLayout = false,
  enableBatchSelect = false,
  pageClassName = 'page-simple-example-list',
}: SimpleExampleListProps) {
  const statusMap = maps.example.simpleExample.exampleStatus;
  const taskMap = maps.example.simpleExample.exampleTaskAction;
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<SimpleExampleRow | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const {
    listFilters,
    setListFilters,
    tableData,
    tableTotal,
    tableLoading,
    tableLoadFailed,
    search,
    handlePageChange,
    handleSizeChange,
  } = useTableQuery<
    SimpleExampleRow,
    { exampleName: string; status: number | ''; taskAction: string | '' }
  >({
    defaultFilters: { exampleName: '', status: '', taskAction: '' },
    fetcher: async (query, _signal) =>
      requestSimpleExampleList(query) as Promise<{
        data: { lists: SimpleExampleRow[]; total: number };
      }>,
    immediate: true,
  });

  const maxHeight = useAdminTableMaxHeight(`.${pageClassName}`, 400);

  const extraFields = useMemo(() => {
    const count = filterFieldCount ?? 0;
    return Array.from({ length: Math.max(0, count - 3) }, (_, i) => (
      <div
        className="do-filter-field"
        key={`extra-${i}`}
      >
        <span className="do-filter-field-label">扩展{i + 1}</span>
        <Input
          placeholder={`筛选项 ${i + 1}`}
          style={{ width: 140 }}
          allowClear
        />
      </div>
    ));
  }, [filterFieldCount]);

  const columns: ColumnsType<SimpleExampleRow> = [
    {
      title: '名称',
      dataIndex: 'exampleName',
      minWidth: 160,
      render: (v, row) => (
        <div>
          <div>{v}</div>
          <div style={{ color: '#999', fontSize: 12 }}>ID: {row.id}</div>
        </div>
      ),
    },
    { title: '包名', dataIndex: 'pkg', minWidth: 120, render: (v) => v || '—' },
    {
      title: '任务动作',
      dataIndex: 'taskAction',
      width: 120,
      render: (v) => taskMap.getLabel?.(v) ?? String(v ?? '—'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v) => statusMap.getLabel(v),
    },
    { title: '创建时间', dataIndex: 'createTime', width: 180, render: (v) => v || '—' },
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
          新建
        </Button>
      ),
      key: 'ops',
      width: 140,
      fixed: 'right',
      render: (_, row) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setEditRow(row);
              setEditOpen(true);
            }}
          >
            编辑
          </Button>
          <Button
            size="small"
            danger
            onClick={() => {
              Modal.confirm({
                title: '确认删除该示例？',
                onOk: async () => {
                  await requestDeleteSimpleExample({ id: row.id });
                  message.success('已删除');
                  void search(false);
                },
              });
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const ctl =
    filterButtonCount >= 2 ? (
      <Space>
        <Button onClick={() => void search(true)}>重置</Button>
        {filterButtonCount >= 3 ? <Button>导出</Button> : null}
        {filterButtonCount >= 4 ? <Button>更多</Button> : null}
      </Space>
    ) : null;

  return (
    <div
      className={pageClassName}
      style={
        fillViewportLayout
          ? { height: '100%', display: 'flex', flexDirection: 'column' }
          : undefined
      }
    >
      <DoFilterPanel
        line={filterLine}
        loading={tableLoading}
        onSearch={() => void search(true)}
        ctl={ctl}
        hideSearch={filterButtonCount < 1}
      >
        <div className="do-filter-field">
          <span className="do-filter-field-label">名称</span>
          <Input
            allowClear
            placeholder="示例名称"
            style={{ width: 180 }}
            value={listFilters.exampleName}
            onChange={(e) => setListFilters({ exampleName: e.target.value })}
            onPressEnter={() => void search(true)}
          />
        </div>
        <div className="do-filter-field">
          <span className="do-filter-field-label">状态</span>
          <Radio.Group
            value={listFilters.status}
            onChange={(e) => {
              setListFilters({ status: e.target.value });
              void search(true);
            }}
            options={[{ label: '全部', value: '' }, ...statusMap.options]}
          />
        </div>
        <div className="do-filter-field">
          <span className="do-filter-field-label">动作</span>
          <Radio.Group
            value={listFilters.taskAction}
            onChange={(e) => {
              setListFilters({ taskAction: e.target.value });
              void search(true);
            }}
            options={[{ label: '全部', value: '' }, ...(taskMap.options || [])]}
          />
        </div>
        {extraFields}
      </DoFilterPanel>

      <TableWrap
        batch={
          enableBatchSelect ? (
            <Space className="batch-select-control">
              <Button
                size="small"
                onClick={() => setSelectedRowKeys(tableData.map((r) => r.id))}
              >
                全选本页
              </Button>
              <Button
                size="small"
                onClick={() => setSelectedRowKeys([])}
              >
                清空
              </Button>
              <span>已选 {selectedRowKeys.length}</span>
            </Space>
          ) : null
        }
        footer={
          <Pagination
            current={listFilters.pageNum || 1}
            pageSize={listFilters.pageSize || 20}
            total={tableTotal}
            showSizeChanger
            showTotal={(t) => `共 ${t} 条`}
            onChange={(page, size) => {
              if (size !== listFilters.pageSize) void handleSizeChange(size);
              else void handlePageChange(page);
            }}
          />
        }
      >
        <Table
          className="do-inner-scroller page-table"
          rowKey="id"
          loading={tableLoading}
          dataSource={tableData}
          columns={columns}
          pagination={false}
          bordered
          size="middle"
          scroll={{ y: maxHeight }}
          locale={{
            emptyText: tableLoadFailed ? '加载失败，请重试' : '暂无数据',
          }}
          rowSelection={
            enableBatchSelect
              ? {
                  selectedRowKeys,
                  onChange: setSelectedRowKeys,
                }
              : undefined
          }
        />
      </TableWrap>

      <DialogEditSimpleExample
        open={editOpen}
        row={editRow}
        onClose={() => setEditOpen(false)}
        onSuccess={() => void search(false)}
      />
    </div>
  );
}
