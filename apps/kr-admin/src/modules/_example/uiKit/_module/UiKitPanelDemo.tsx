import { Button, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useRef, useState } from 'react';

import CellDateTime from '@/components/CellDateTime';
import CellState from '@/components/CellState';
import DateRange, { type DateRangeValue } from '@/components/DateRange';
import DoFilterPanel from '@/components/DoFilterPanel';
import DoNumberSetter from '@/components/DoNumberSetter';
import { DoSelector } from '@/components/DoSelector';
import DoTxtSetter from '@/components/DoTxtSetter';
import ListPaginationBar from '@/components/ListPaginationBar';
import TableWrap from '@/components/TableWrap';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { useTableQuery } from '@/composables/useTableQuery';
import { message } from '@/plugins/antdApp';

type DemoRow = {
  id: number;
  name: string;
  status: number;
  createdAt: string;
  amount: number;
  switching?: boolean;
  amountChanging?: boolean;
  [key: string]: unknown;
};

const ALL_ROWS: DemoRow[] = [
  { id: 1, name: '春日投放计划', status: 1, createdAt: '2026-03-01 09:12:33', amount: 1200 },
  { id: 2, name: '品牌曝光任务', status: 0, createdAt: '2026-03-05 14:22:01', amount: 860 },
  { id: 3, name: '拉新激励活动', status: 1, createdAt: '2026-03-12 18:40:55', amount: 2300 },
  { id: 4, name: '周末冲刺预算', status: 1, createdAt: '2026-04-02 08:05:12', amount: 540 },
  { id: 5, name: '召回短信批次', status: 0, createdAt: '2026-04-18 11:33:47', amount: 980 },
  { id: 6, name: '素材 A/B 测试', status: 1, createdAt: '2026-05-01 16:20:00', amount: 150 },
  { id: 7, name: '渠道联调样例', status: 1, createdAt: '2026-05-20 10:01:19', amount: 3200 },
  { id: 8, name: '停用归档任务', status: 0, createdAt: '2026-06-03 21:15:44', amount: 70 },
  { id: 9, name: '节日大促排期', status: 1, createdAt: '2026-06-18 09:40:00', amount: 4500 },
  { id: 10, name: '冷启动观察组', status: 0, createdAt: '2026-07-02 15:08:26', amount: 260 },
];

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
];

export default function UiKitPanelDemo() {
  const [rows, setRows] = useState(ALL_ROWS);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const maxHeight = useAdminTableMaxHeight('.page-ui-kit-panel', 400);

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
  } = useTableQuery<
    DemoRow,
    { keyword: string; status: string | number; dateRange: DateRangeValue }
  >({
    defaultFilters: { keyword: '', status: '', dateRange: [] },
    defaultPageSize: 10,
    fetcher: async (query) => {
      await new Promise((resolve) => window.setTimeout(resolve, 280));
      const keyword = String(query.keyword || '');
      const status = query.status;
      const dateRange = (query.dateRange as string[]) || [];
      const filtered = rowsRef.current.filter((row) => {
        if (keyword && !row.name.includes(keyword)) return false;
        if (status !== '' && status !== null && status !== undefined) {
          if (row.status !== Number(status)) return false;
        }
        if (dateRange.length === 2) {
          const [start, end] = dateRange;
          const day = row.createdAt.slice(0, 10);
          if (day < start || day > end) return false;
        }
        return true;
      });
      const pageNum = Number(query.pageNum) || 1;
      const pageSize = Number(query.pageSize) || 10;
      const start = (pageNum - 1) * pageSize;
      return {
        data: {
          lists: filtered.slice(start, start + pageSize),
          total: filtered.length,
        },
      };
    },
  });

  const columns: ColumnsType<DemoRow> = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id', width: 70, align: 'center' },
      { title: '名称', dataIndex: 'name', minWidth: 140 },
      {
        title: '状态',
        dataIndex: 'status',
        width: 120,
        align: 'center',
        render: (_, row) => (
          <CellState
            modelValue={row.status}
            switchable
            switching={!!row.switching}
            onSwitch={(val) => {
              setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, switching: true } : r)));
              window.setTimeout(() => {
                setRows((prev) =>
                  prev.map((r) =>
                    r.id === row.id ? { ...r, status: Number(val), switching: false } : r,
                  ),
                );
                message.success(`已${Number(val) === 1 ? '启用' : '禁用'}：${row.name}`);
                void search(false);
              }, 400);
            }}
          />
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        minWidth: 160,
        render: (v) => <CellDateTime value={v} />,
      },
      {
        title: '数量',
        dataIndex: 'amount',
        width: 140,
        align: 'right',
        render: (_, row) => (
          <DoNumberSetter
            num={row.amount}
            newValue={row.amount}
            changing={!!row.amountChanging}
            onOk={(val) => {
              setRows((prev) =>
                prev.map((r) => (r.id === row.id ? { ...r, amountChanging: true } : r)),
              );
              window.setTimeout(() => {
                setRows((prev) =>
                  prev.map((r) =>
                    r.id === row.id ? { ...r, amount: val, amountChanging: false } : r,
                  ),
                );
                message.success(`数量已更新为 ${val}`);
                void search(false);
              }, 350);
            }}
          >
            {row.amount}
          </DoNumberSetter>
        ),
      },
    ],
    [search],
  );

  return (
    <div className="page-ui-kit-panel">
      <DoFilterPanel
        line={1}
        loading={tableLoading}
        onSearch={() => void search(true)}
        ctl={
          <Button
            disabled={tableLoading}
            onClick={() =>
              void reset({
                keyword: '',
                status: '',
                dateRange: [],
              })
            }
          >
            重置
          </Button>
        }
      >
        <div className="do-filter-field">
          <span className="do-filter-field-label">日期</span>
          <DateRange
            value={listFilters.dateRange}
            style={{ width: 240 }}
            onChange={(v) => {
              setListFilters({ dateRange: v });
              void search(true);
            }}
          />
        </div>
        <div className="do-filter-field">
          <span className="do-filter-field-label">关键字</span>
          <DoTxtSetter
            inline
            initValue={listFilters.keyword}
            onOk={(value) => {
              setListFilters({ keyword: value ?? '' });
              void search(true);
            }}
          >
            <span className="line-txt">{listFilters.keyword || '点击编辑关键字'}</span>
          </DoTxtSetter>
        </div>
        <div className="do-filter-field">
          <span className="do-filter-field-label">状态</span>
          <DoSelector
            value={listFilters.status === '' ? null : listFilters.status}
            clearable
            style={{ width: 140 }}
            options={statusOptions}
            onChange={(v) => {
              setListFilters({ status: (v as number | '') ?? '' });
              void search(true);
            }}
          />
        </div>
      </DoFilterPanel>

      <TableWrap
        enableDoHeader
        disabledColumnConfig
        control={
          <Button
            type="primary"
            onClick={() => message.success('演示：新建')}
          >
            新建
          </Button>
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
          className="do-inner-scroller page-table hide-table-border"
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
    </div>
  );
}
