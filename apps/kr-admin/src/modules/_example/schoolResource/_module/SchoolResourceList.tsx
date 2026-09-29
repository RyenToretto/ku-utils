import { Button, Input, Pagination, Radio, Space, Table, message, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

import DialogEditSchoolResource from './DialogEditSchoolResource';

import DoFilterPanel from '@/components/DoFilterPanel';
import TableWrap from '@/components/TableWrap';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { useTableQuery } from '@/composables/useTableQuery';
import maps from '@/maps';
import {
  requestDeleteSchoolResource,
  requestSchoolResourcePage,
  type SchoolResourceRow,
} from '@/modules/_example/schoolResource/_api';

export type SchoolResourceListProps = {
  enableSelector?: boolean;
  isMultiple?: boolean;
  inDialog?: boolean;
  checkedIds?: string[];
  lockEnabledStatus?: boolean;
  defaultPageSize?: number;
  onChange?: (row: SchoolResourceRow | SchoolResourceRow[] | undefined) => void;
  onLoaded?: () => void;
  onLoadFailed?: () => void;
};

export default function SchoolResourceList({
  enableSelector = false,
  isMultiple = false,
  inDialog = false,
  checkedIds = [],
  lockEnabledStatus = false,
  defaultPageSize,
  onChange,
  onLoaded,
  onLoadFailed,
}: SchoolResourceListProps) {
  const status = maps.example.schoolResource.schoolStatus;
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<SchoolResourceRow | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>(checkedIds);
  const pageClass = inDialog ? 'page-school-resource-list-dialog' : 'page-school-resource-list';

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
  } = useTableQuery<SchoolResourceRow, { schoolName: string; status: number | '' }>({
    defaultFilters: {
      schoolName: '',
      status: lockEnabledStatus ? status.SCHOOL_STATUS_ENABLED : '',
    },
    defaultPageSize: defaultPageSize ?? (enableSelector ? 10 : 20),
    immediate: true,
    fetcher: async (query, signal) =>
      requestSchoolResourcePage(query, signal) as Promise<{
        data: { lists: SchoolResourceRow[]; total: number };
      }>,
    transformQuery: (q) => {
      if (lockEnabledStatus) q.status = status.SCHOOL_STATUS_ENABLED;
      return q;
    },
    onLoaded: () => onLoaded?.(),
    onError: () => onLoadFailed?.(),
  });

  const maxHeight = useAdminTableMaxHeight(`.${pageClass}`, inDialog ? 360 : 400);

  const columns: ColumnsType<SchoolResourceRow> = [
    { title: '学校名称', dataIndex: 'schoolName', minWidth: 160 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v) => status.getLabel(v),
    },
    { title: '备注', dataIndex: 'remark', minWidth: 140, render: (v) => v || '—' },
    { title: '创建时间', dataIndex: 'createTime', width: 180 },
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
            onClick={(e) => {
              e.stopPropagation();
              setEditRow(row);
              setEditOpen(true);
            }}
          >
            编辑
          </Button>
          <Button
            size="small"
            danger
            onClick={(e) => {
              e.stopPropagation();
              Modal.confirm({
                title: '确认删除该学校？',
                onOk: async () => {
                  await requestDeleteSchoolResource({ id: row.id });
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

  return (
    <div className={pageClass}>
      <DoFilterPanel
        loading={tableLoading}
        onSearch={() => void search(true)}
      >
        <div className="do-filter-field">
          <span className="do-filter-field-label">名称</span>
          <Input
            allowClear
            style={{ width: 180 }}
            value={listFilters.schoolName}
            onChange={(e) => setListFilters({ schoolName: e.target.value })}
            onPressEnter={() => void search(true)}
          />
        </div>
        <div className="do-filter-field">
          <span className="do-filter-field-label">状态</span>
          <Radio.Group
            disabled={lockEnabledStatus}
            value={listFilters.status}
            onChange={(e) => {
              setListFilters({ status: e.target.value });
              void search(true);
            }}
            options={[{ label: '全部', value: '' }, ...status.options]}
          />
        </div>
      </DoFilterPanel>
      <TableWrap
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
          rowKey="id"
          loading={tableLoading}
          dataSource={tableData}
          columns={columns}
          pagination={false}
          bordered
          size="middle"
          scroll={{ y: maxHeight }}
          locale={{ emptyText: tableLoadFailed ? '加载失败' : '暂无数据' }}
          rowSelection={
            enableSelector
              ? {
                  type: isMultiple ? 'checkbox' : 'radio',
                  selectedRowKeys: selectedKeys,
                  onChange: (keys, rows) => {
                    setSelectedKeys(keys);
                    onChange?.(isMultiple ? rows : rows[0]);
                  },
                }
              : undefined
          }
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

export type SchoolResourceListHandle = {
  search: (reset?: boolean) => Promise<void>;
  setChecked: (ids: string[]) => void;
  clearSelection: () => void;
};
