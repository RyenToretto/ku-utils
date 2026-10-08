import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Input, Radio, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

import DialogEditClazzManage from './DialogEditClazzManage';

import CellDateTime from '@/components/CellDateTime';
import CellNameId from '@/components/CellNameId';
import CellState from '@/components/CellState';
import DoFilterPanel from '@/components/DoFilterPanel';
import ListPaginationBar from '@/components/ListPaginationBar';
import TableWrap from '@/components/TableWrap';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { useFlexColumns } from '@/composables/useFlexColumns';
import { useTableQuery } from '@/composables/useTableQuery';
import maps from '@/maps';
import {
  requestDeleteClazzManage,
  requestClazzManageList,
  type ClazzManageRow,
} from '@/modules/_example/clazzManage/_api';
import {
  CLAZZ_STATUS_DISABLED,
  CLAZZ_STATUS_ENABLED,
} from '@/modules/_example/clazzManage/_map/clazzStatus';
import { message, modal } from '@/plugins/antdApp';

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
    reset,
    handlePageChange,
    handleSizeChange,
  } = useTableQuery<ClazzManageRow, { clazzName: string; status: number | '' }>({
    defaultFilters: { clazzName: '', status: '' },
    defaultPageSize: 10,
    fetcher: async (query, signal) =>
      requestClazzManageList(query, signal) as Promise<{
        data: { lists: ClazzManageRow[]; total: number };
      }>,
  });
  const maxHeight = useAdminTableMaxHeight('.page-clazz-manage', 400);

  const columns: ColumnsType<ClazzManageRow> = [
    {
      title: '班级名称',
      dataIndex: 'clazzName',
      minWidth: 160,
      className: 'name-slot-cell',
      render: (_, row) => (
        <CellNameId
          id={row.id}
          name={row.clazzName}
        />
      ),
    },
    {
      title: '所属学校',
      dataIndex: 'schoolName',
      minWidth: 160,
      ellipsis: true,
      render: (v) => v || '—',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (v) => (
        <CellState
          modelValue={v}
          activeValue={CLAZZ_STATUS_ENABLED}
          inactiveValue={CLAZZ_STATUS_DISABLED}
          activeLabel={status.getLabel(CLAZZ_STATUS_ENABLED)}
          inactiveLabel={status.getLabel(CLAZZ_STATUS_DISABLED)}
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
          新建班级
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
            onClick={() => {
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
            onClick={() => {
              modal.confirm({
                title: '提示',
                content: `确认删除「${row.clazzName}」？`,
                onOk: async () => {
                  await requestDeleteClazzManage({ id: row.id });
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

  const flexColumns = useFlexColumns(columns, '.page-clazz-manage');

  return (
    <div className="page-clazz-manage">
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
          <span className="do-filter-field-label">班级名称</span>
          <Input
            allowClear
            placeholder="不限"
            value={listFilters.clazzName}
            onChange={(e) => setListFilters({ clazzName: e.target.value })}
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
      <DialogEditClazzManage
        open={editOpen}
        row={editRow}
        onClose={() => setEditOpen(false)}
        onSuccess={() => void search(false)}
      />
    </div>
  );
}
