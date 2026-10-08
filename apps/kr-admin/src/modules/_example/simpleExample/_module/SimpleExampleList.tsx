import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Input, Radio, Select, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';

import DialogEditSimpleExample from './DialogEditSimpleExample';

import CellDateTime from '@/components/CellDateTime';
import CellNameId from '@/components/CellNameId';
import CellState from '@/components/CellState';
import DoFilterPanel from '@/components/DoFilterPanel';
import ListPaginationBar from '@/components/ListPaginationBar';
import TableWrap from '@/components/TableWrap';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { useTableQuery } from '@/composables/useTableQuery';
import maps from '@/maps';
import {
  buildDoFilterPanelDemoFields,
  createDoFilterPanelDemoFilters,
} from '@/modules/_example/doFilterPanel/_utils/doFilterPanelDemo';
import {
  requestBatchSimpleExample,
  requestDeleteSimpleExample,
  requestSimpleExampleList,
} from '@/modules/_example/simpleExample/_api';
import { message, modal } from '@/plugins/antdApp';

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
  pageClassName?: string;
};

export default function SimpleExampleList({
  filterFieldCount,
  filterButtonCount = 2,
  filterLine,
  fillViewportLayout = false,
  pageClassName = 'page-simple-example-list',
}: SimpleExampleListProps) {
  const statusMap = maps.example.simpleExample.exampleStatus;
  const taskMap = maps.example.simpleExample.exampleTaskAction;
  const isFilterPanelDemo = filterFieldCount != null && filterFieldCount > 0;
  const resolvedFilterLine = filterLine ?? (isFilterPanelDemo ? 1 : 1);
  const resolvedButtonCount = filterButtonCount ?? 2;

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<SimpleExampleRow | null>(null);
  const [statusSwitchingIds, setStatusSwitchingIds] = useState<Record<string, boolean>>({});
  const [demoFilters, setDemoFilters] = useState<Record<string, string>>(() =>
    isFilterPanelDemo ? createDoFilterPanelDemoFilters(filterFieldCount!) : {},
  );

  const demoFields = useMemo(
    () => (isFilterPanelDemo ? buildDoFilterPanelDemoFields(filterFieldCount!) : []),
    [filterFieldCount, isFilterPanelDemo],
  );

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
  } = useTableQuery<
    SimpleExampleRow,
    { exampleName: string; status: number | ''; taskAction: string | '' }
  >({
    defaultFilters: { exampleName: '', status: '', taskAction: '' },
    defaultPageSize: 10,
    fetcher: async (query, _signal) =>
      requestSimpleExampleList(query) as Promise<{
        data: { lists: SimpleExampleRow[]; total: number };
      }>,
    immediate: true,
  });

  const maxHeight = useAdminTableMaxHeight(`.${pageClassName}`, 400);

  function handleReset() {
    if (isFilterPanelDemo) {
      setDemoFilters(createDoFilterPanelDemoFilters(filterFieldCount!));
      void search(true);
      return;
    }
    void reset();
  }

  function onDemoExtra(kind: 'export' | 'more') {
    message.success(`已触发「${kind === 'export' ? '导出' : '更多'}」（Demo）`);
  }

  async function switchExampleStatus(row: SimpleExampleRow, nextStatus: string | number | boolean) {
    const key = String(row.id);
    setStatusSwitchingIds((prev) => ({ ...prev, [key]: true }));
    try {
      await requestBatchSimpleExample([row.id], Number(nextStatus));
      patchRow((item) => item.id === row.id, { status: Number(nextStatus) });
      message.success(Number(nextStatus) === 1 ? '已启用' : '已停用');
    } finally {
      setStatusSwitchingIds((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  const columns: ColumnsType<SimpleExampleRow> = [
    {
      title: '示例名称',
      dataIndex: 'exampleName',
      minWidth: 160,
      className: 'name-slot-cell',
      render: (_, row) => (
        <CellNameId
          id={row.id}
          name={row.exampleName}
        />
      ),
    },
    {
      title: '产品包名',
      dataIndex: 'pkg',
      minWidth: 160,
      render: (v) => v || '—',
    },
    {
      title: '任务类型',
      dataIndex: 'taskAction',
      width: 100,
      align: 'center',
      render: (v) => taskMap.getLabel?.(v) ?? String(v ?? '—'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (_, row) => (
        <CellState
          modelValue={row.status}
          activeValue={1}
          inactiveValue={0}
          activeLabel={statusMap.getLabel(1)}
          inactiveLabel={statusMap.getLabel(0)}
          switchable
          switching={!!statusSwitchingIds[String(row.id)]}
          activeTips="确认启用该示例？"
          inactiveTips="确认停用该示例？"
          onSwitch={(next) => void switchExampleStatus(row, next)}
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
          新建示例
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
                content: `确认删除「${row.exampleName}」？`,
                onOk: async () => {
                  await requestDeleteSimpleExample({ id: row.id });
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

  const ctl =
    resolvedButtonCount >= 2 ? (
      <Space>
        <Button
          disabled={tableLoading}
          onClick={handleReset}
        >
          重置
        </Button>
        {resolvedButtonCount >= 3 ? (
          <Button
            disabled={tableLoading}
            onClick={() => onDemoExtra('export')}
          >
            导出
          </Button>
        ) : null}
        {resolvedButtonCount >= 4 ? (
          <Button
            disabled={tableLoading}
            onClick={() => onDemoExtra('more')}
          >
            更多
          </Button>
        ) : null}
      </Space>
    ) : null;

  return (
    <div
      className={[pageClassName, fillViewportLayout ? 'fill-viewport' : '']
        .filter(Boolean)
        .join(' ')}
    >
      <DoFilterPanel
        line={resolvedFilterLine}
        loading={tableLoading}
        onSearch={() => void search(true)}
        ctl={ctl}
        hideSearch={resolvedButtonCount < 1}
      >
        {isFilterPanelDemo
          ? demoFields.map((field) => (
              <div
                className="do-filter-field"
                key={field.key}
              >
                <span className="do-filter-field-label">筛选项 {field.key.slice(1)}</span>
                {field.kind === 'input' ? (
                  <Input
                    allowClear
                    placeholder="不限"
                    style={{ width: 140 }}
                    value={demoFilters[field.key] ?? ''}
                    onChange={(e) =>
                      setDemoFilters((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    onPressEnter={() => void search(true)}
                  />
                ) : null}
                {field.kind === 'select' ? (
                  <Select
                    allowClear
                    placeholder="不限"
                    style={{ width: 140 }}
                    value={demoFilters[field.key] || undefined}
                    onChange={(v) => setDemoFilters((prev) => ({ ...prev, [field.key]: v ?? '' }))}
                    options={[
                      { label: '启用', value: '1' },
                      { label: '停用', value: '0' },
                    ]}
                  />
                ) : null}
                {field.kind === 'radio' ? (
                  <Radio.Group
                    optionType="button"
                    buttonStyle="solid"
                    size="small"
                    value={demoFilters[field.key] ?? ''}
                    onChange={(e) => {
                      setDemoFilters((prev) => ({ ...prev, [field.key]: e.target.value }));
                      void search(true);
                    }}
                    options={[
                      { label: '不限', value: '' },
                      { label: '启用', value: '1' },
                      { label: '停用', value: '0' },
                    ]}
                  />
                ) : null}
              </div>
            ))
          : [
              <div
                className="do-filter-field"
                key="name"
              >
                <span className="do-filter-field-label">示例名称</span>
                <Input
                  allowClear
                  placeholder="不限"
                  style={{ width: 180 }}
                  value={listFilters.exampleName}
                  onChange={(e) => setListFilters({ exampleName: e.target.value })}
                  onPressEnter={() => void search(true)}
                />
              </div>,
              <div
                className="do-filter-field"
                key="task"
              >
                <span className="do-filter-field-label">任务类型</span>
                <Radio.Group
                  optionType="button"
                  buttonStyle="solid"
                  size="small"
                  value={listFilters.taskAction}
                  onChange={(e) => {
                    setListFilters({ taskAction: e.target.value });
                    void search(true);
                  }}
                  options={[{ label: '不限', value: '' }, ...(taskMap.options || [])]}
                />
              </div>,
              <div
                className="do-filter-field"
                key="status"
              >
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
                  options={[{ label: '不限', value: '' }, ...statusMap.options]}
                />
              </div>,
            ]}
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

      <DialogEditSimpleExample
        open={editOpen}
        row={editRow}
        onClose={() => setEditOpen(false)}
        onSuccess={() => void search(false)}
      />
    </div>
  );
}
