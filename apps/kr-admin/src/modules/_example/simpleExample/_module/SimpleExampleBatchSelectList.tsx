import { Button, Input, Radio, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

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
import { requestSimpleExampleList } from '@/modules/_example/simpleExample/_api';

type ExampleRow = {
  id: number;
  exampleName: string;
  pkg: string;
  status: number;
  taskAction: string;
  createTime: string;
};

/** 表外全选（#batch 区「全选本页」）+ 行勾选，对齐 kv3 `SimpleExampleBatchSelectList.vue` */
export default function SimpleExampleBatchSelectList() {
  const statusMap = maps.example.simpleExample.exampleStatus;
  const maxHeight = useAdminTableMaxHeight('.page-simple-example-batch-select', 400);

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
  } = useTableQuery<ExampleRow, { exampleName: string; status: number | '' }>({
    defaultFilters: { exampleName: '', status: '' },
    defaultPageSize: 10,
    fetcher: async (query) =>
      requestSimpleExampleList(query) as Promise<{
        data: { lists: ExampleRow[]; total: number };
      }>,
    immediate: true,
  });

  const selector = useRowSelector<ExampleRow>({ tableData, lineKey: 'id', isMultiple: true });
  const { selectRows, statusOfSelect, toggleBatchSelect, chooseRow } = selector;

  const columns: ColumnsType<ExampleRow> = [
    createSelectColumn(selector, { batchHeader: false }),
    {
      title: '示例名称',
      dataIndex: 'exampleName',
      minWidth: 160,
      className: 'name-slot-cell',
      ellipsis: true,
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
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      minWidth: 160,
      render: (v) => <CellDateTime value={v} />,
    },
  ];

  const flexColumns = useFlexColumns(columns, '.page-simple-example-batch-select');

  return (
    <div className="page-simple-example-batch-select">
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
          <span className="do-filter-field-label">示例名称</span>
          <Input
            allowClear
            placeholder="不限"
            value={listFilters.exampleName}
            onChange={(e) => setListFilters({ exampleName: e.target.value })}
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
            options={[{ label: '不限', value: '' }, ...statusMap.options]}
          />
        </div>
      </DoFilterPanel>

      <TableWrap
        enableDoHeader
        batch={
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
            {selectRows.length ? (
              <span className="batch-select-count">已选 {selectRows.length}</span>
            ) : null}
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
          onRow={(row) => ({ onClick: () => chooseRow(row) })}
        />
      </TableWrap>
    </div>
  );
}
