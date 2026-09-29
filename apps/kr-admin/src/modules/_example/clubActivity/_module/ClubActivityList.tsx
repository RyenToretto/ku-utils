import { Button, Input, Pagination, Radio, Space, Table, Tag, message, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

import DialogEditClubActivity from './DialogEditClubActivity';

import DoFilterPanel from '@/components/DoFilterPanel';
import TableWrap from '@/components/TableWrap';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { useTableQuery } from '@/composables/useTableQuery';
import maps from '@/maps';
import {
  requestDeleteClubActivity,
  requestClubActivityList,
  type ClubActivityRow,
} from '@/modules/_example/clubActivity/_api';

export default function ClubActivityList() {
  const status = maps.example.clubActivity.clubStatus;
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<ClubActivityRow | null>(null);
  const {
    listFilters,
    setListFilters,
    tableData,
    tableTotal,
    tableLoading,
    search,
    handlePageChange,
    handleSizeChange,
  } = useTableQuery<ClubActivityRow, { clubName: string; status: number | '' }>({
    defaultFilters: { clubName: '', status: '' },
    fetcher: async (query, signal) =>
      requestClubActivityList(query, signal) as Promise<{
        data: { lists: ClubActivityRow[]; total: number };
      }>,
  });
  const maxHeight = useAdminTableMaxHeight('.page-club-activity', 400);

  const columns: ColumnsType<ClubActivityRow> = [
    { title: '社团名称', dataIndex: 'clubName', minWidth: 140 },
    {
      title: '关联学校',
      dataIndex: 'schools',
      minWidth: 200,
      render: (schools: ClubActivityRow['schools']) =>
        schools?.length ? schools.map((s) => <Tag key={s.id}>{s.schoolName}</Tag>) : '—',
    },
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
                title: '确认删除该社团？',
                onOk: async () => {
                  await requestDeleteClubActivity({ id: row.id });
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
    <div className="page-club-activity">
      <DoFilterPanel
        loading={tableLoading}
        onSearch={() => void search(true)}
      >
        <div className="do-filter-field">
          <span className="do-filter-field-label">名称</span>
          <Input
            allowClear
            style={{ width: 180 }}
            value={listFilters.clubName}
            onChange={(e) => setListFilters({ clubName: e.target.value })}
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
      <DialogEditClubActivity
        open={editOpen}
        row={editRow}
        onClose={() => setEditOpen(false)}
        onSuccess={() => void search(false)}
      />
    </div>
  );
}
