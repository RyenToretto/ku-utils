import { Button, Input, Pagination, Radio, Space, Table, message, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

import DialogEditClazzManage from './DialogEditClazzManage';

import DoFilterPanel from '@/components/DoFilterPanel';
import TableWrap from '@/components/TableWrap';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { useTableQuery } from '@/composables/useTableQuery';
import maps from '@/maps';
import {
  requestDeleteClazzManage,
  requestClazzManageList,
  type ClazzManageRow,
} from '@/modules/_example/clazzManage/_api';

export default function ClazzManageList() {
  const status = maps.example.clazzManage.clazzStatus;
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<ClazzManageRow | null>(null);
  const {
    listFilters,
    setListFilters,
    tableData,
    tableTotal,
    tableLoading,
    search,
    handlePageChange,
    handleSizeChange,
  } = useTableQuery<ClazzManageRow, { clazzName: string; status: number | '' }>({
    defaultFilters: { clazzName: '', status: '' },
    fetcher: async (query, signal) =>
      requestClazzManageList(query, signal) as Promise<{
        data: { lists: ClazzManageRow[]; total: number };
      }>,
  });
  const maxHeight = useAdminTableMaxHeight('.page-clazz-manage', 400);

  const columns: ColumnsType<ClazzManageRow> = [
    { title: '班级名称', dataIndex: 'clazzName', minWidth: 140 },
    { title: '学校', dataIndex: 'schoolName', minWidth: 140, render: (v) => v || '—' },
    { title: '状态', dataIndex: 'status', width: 100, render: (v) => status.getLabel(v) },
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
                title: '确认删除该班级？',
                onOk: async () => {
                  await requestDeleteClazzManage({ id: row.id });
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
    <div className="page-clazz-manage">
      <DoFilterPanel
        loading={tableLoading}
        onSearch={() => void search(true)}
      >
        <div className="do-filter-field">
          <span className="do-filter-field-label">名称</span>
          <Input
            allowClear
            style={{ width: 180 }}
            value={listFilters.clazzName}
            onChange={(e) => setListFilters({ clazzName: e.target.value })}
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
        />
      </TableWrap>
      <DialogEditClazzManage
        open={editOpen}
        row={editRow}
        onClose={() => setEditOpen(false)}
        onSuccess={() => void search(false)}
      />
    </div>
  );
}
