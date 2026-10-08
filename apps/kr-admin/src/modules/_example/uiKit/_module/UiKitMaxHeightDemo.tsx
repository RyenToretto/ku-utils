import { Button, Input, Radio, Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import CellDateTime from '@/components/CellDateTime';
import DateRange, { type DateRangeValue } from '@/components/DateRange';
import DoFilterPanel from '@/components/DoFilterPanel';
import ListPaginationBar from '@/components/ListPaginationBar';
import TableWrap from '@/components/TableWrap';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { useTableQuery } from '@/composables/useTableQuery';

type DemoRow = {
  id: string;
  name: string;
  colA: string;
  colB: string;
  colC: string;
  colD: string;
  colE: string;
  colF: string;
  owner: string;
  status: number;
  createdAt: string;
  channel: string;
  region: string;
  tag: string;
  [key: string]: unknown;
};

const channelOptions = [
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Meta', value: 'meta' },
];

const regionOptions = [
  { label: '北京', value: 'bj' },
  { label: '上海', value: 'sh' },
  { label: '深圳', value: 'sz' },
];

const seedRows: DemoRow[] = Array.from({ length: 16 }, (_, i) => {
  const n = i + 1;
  return {
    id: String(n),
    name: `演示策略 ${n}`,
    colA: `列A-${n}`,
    colB: `列B-${n}`,
    colC: `列C-${n}`,
    colD: `列D-${n}`,
    colE: `列E-${n}`,
    colF: `列F-${n}`,
    owner: n % 2 === 0 ? '王婧婷' : '张伟',
    status: n % 3 === 0 ? 0 : 1,
    createdAt: `2026-08-${String((n % 28) + 1).padStart(2, '0')}T12:00:00+08:00`,
    channel: n % 2 === 0 ? 'tiktok' : 'meta',
    region: ['bj', 'sh', 'sz'][n % 3]!,
    tag: `tag-${n}`,
  };
});

export default function UiKitMaxHeightDemo() {
  const maxHeight = useAdminTableMaxHeight('.page-ui-kit-max-height', 400);
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
    {
      dateRange: DateRangeValue;
      keyword: string;
      status: string | number;
      owner: string;
      channel: string;
      region: string;
      tag: string;
    }
  >({
    defaultFilters: {
      dateRange: [],
      keyword: '',
      status: '',
      owner: '',
      channel: '',
      region: '',
      tag: '',
    },
    defaultPageSize: 20,
    fetcher: async (query) => {
      const keyword = String(query.keyword ?? '').trim();
      const status = query.status;
      const owner = String(query.owner ?? '').trim();
      const channel = String(query.channel ?? '');
      const region = String(query.region ?? '');
      const tag = String(query.tag ?? '').trim();
      let lists = seedRows.filter((row) => {
        if (keyword && !row.name.includes(keyword) && !row.id.includes(keyword)) return false;
        if (status !== '' && status != null && Number(status) !== row.status) return false;
        if (owner && !row.owner.includes(owner)) return false;
        if (channel && row.channel !== channel) return false;
        if (region && row.region !== region) return false;
        if (tag && !row.tag.includes(tag)) return false;
        return true;
      });
      const pageNum = Number(query.pageNum) || 1;
      const pageSize = Number(query.pageSize) || 20;
      const total = lists.length;
      const start = (pageNum - 1) * pageSize;
      lists = lists.slice(start, start + pageSize);
      return { lists, total };
    },
  });

  const columns: ColumnsType<DemoRow> = [
    { title: '名称', dataIndex: 'name', minWidth: 200, fixed: 'left' },
    { title: '列 A', dataIndex: 'colA', minWidth: 140 },
    { title: '列 B', dataIndex: 'colB', minWidth: 140 },
    { title: '列 C', dataIndex: 'colC', minWidth: 140 },
    { title: '列 D', dataIndex: 'colD', minWidth: 140 },
    { title: '列 E', dataIndex: 'colE', minWidth: 140 },
    { title: '列 F', dataIndex: 'colF', minWidth: 140 },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (_, row) => (
        <CellDateTime
          layout="with-actor"
          value={row.createdAt}
          actor={row.owner}
        />
      ),
    },
    {
      title: (
        <Button
          type="primary"
          size="small"
        >
          新建
        </Button>
      ),
      key: 'ops',
      width: 220,
      fixed: 'right',
      className: 'ops-column',
      render: () => (
        <div className="line-actions">
          <Button
            size="small"
            ghost
          >
            编辑
          </Button>
          <Button
            size="small"
            ghost
          >
            复制
          </Button>
          <Button
            type="primary"
            size="small"
            ghost
          >
            立即使用
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-ui-kit-max-height">
      <DoFilterPanel
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
          <span className="do-filter-field-label">日期</span>
          <DateRange
            value={listFilters.dateRange}
            style={{ width: 240 }}
            onChange={(v) => setListFilters({ dateRange: v })}
          />
        </div>
        <div className="do-filter-field">
          <span className="do-filter-field-label">关键字</span>
          <Input
            allowClear
            placeholder="不限"
            style={{ width: 180 }}
            value={listFilters.keyword}
            onChange={(e) => setListFilters({ keyword: e.target.value })}
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
            options={[
              { label: '不限', value: '' },
              { label: '启用', value: 1 },
              { label: '停用', value: 0 },
            ]}
          />
        </div>
        <div className="do-filter-field">
          <span className="do-filter-field-label">负责人</span>
          <Input
            allowClear
            placeholder="不限"
            style={{ width: 140 }}
            value={listFilters.owner}
            onChange={(e) => setListFilters({ owner: e.target.value })}
          />
        </div>
        <div className="do-filter-field">
          <span className="do-filter-field-label">渠道</span>
          <Select
            allowClear
            placeholder="不限"
            style={{ width: 140 }}
            value={listFilters.channel || undefined}
            options={channelOptions}
            onChange={(v) => setListFilters({ channel: v ?? '' })}
          />
        </div>
        <div className="do-filter-field">
          <span className="do-filter-field-label">地区</span>
          <Select
            allowClear
            placeholder="不限"
            style={{ width: 140 }}
            value={listFilters.region || undefined}
            options={regionOptions}
            onChange={(v) => setListFilters({ region: v ?? '' })}
          />
        </div>
        <div className="do-filter-field">
          <span className="do-filter-field-label">标签</span>
          <Input
            allowClear
            placeholder="不限"
            style={{ width: 140 }}
            value={listFilters.tag}
            onChange={(e) => setListFilters({ tag: e.target.value })}
          />
        </div>
      </DoFilterPanel>

      <TableWrap
        footer={
          <ListPaginationBar
            pageNum={listFilters.pageNum || 1}
            pageSize={listFilters.pageSize || 20}
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
          columns={columns}
          pagination={false}
          size="middle"
          scroll={{ x: 1400, y: maxHeight }}
        />
      </TableWrap>
    </div>
  );
}
