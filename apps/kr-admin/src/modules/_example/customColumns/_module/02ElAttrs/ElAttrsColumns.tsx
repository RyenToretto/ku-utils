import {
  useSchemaColumnConfig,
  DoConfigColumnDialog,
  schemasToColumns,
  SchemaColumnConfigContext,
  type ColumnSchema,
} from '@ku-utils/r-custom-columns';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import TableWrap from '@/components/TableWrap';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { DEMO_CUSTOM_COLUMN_MESSAGES } from '@/modules/_example/customColumns/_utils/demoSchemas';
import {
  useCustomColumnsDemoData,
  type DemoRow,
} from '@/modules/_example/customColumns/_utils/useCustomColumnsDemoData';

const columnSchemas: ColumnSchema[] = [
  {
    prop: 'amount',
    label: '数量',
    minWidth: 100,
    align: 'right',
    renderType: 'integer',
    isDefault: true,
    showOverflowTooltip: true,
    antdAttrs: { ellipsis: { showTitle: true } },
  },
  {
    prop: 'cost',
    label: '成本（超长提示）',
    minWidth: 140,
    align: 'right',
    renderType: 'float',
    isDefault: true,
    showOverflowTooltip: true,
    antdAttrs: { ellipsis: { showTitle: true } },
  },
  {
    prop: 'roi',
    label: 'ROI',
    minWidth: 100,
    align: 'right',
    renderType: 'float',
    isDefault: true,
  },
];

export default function ElAttrsColumns() {
  const maxHeight = useAdminTableMaxHeight('.page-el-attrs-columns', 400);
  const { tableLoading, tableData } = useCustomColumnsDemoData();

  const config = useSchemaColumnConfig({
    columnSchemas,
    storageKey: 'kr-example-el-attrs',
    schemaVersion: 1,
    messages: DEMO_CUSTOM_COLUMN_MESSAGES,
  });

  const columns: ColumnsType<DemoRow> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      fixed: 'left',
      align: 'center',
    },
    {
      title: '名称',
      dataIndex: 'name',
      minWidth: 120,
      fixed: 'left',
    },
    ...schemasToColumns<DemoRow>(config.visibleSchemas, {
      formatCell: config.formatSchemaCell,
    }),
  ];

  return (
    <SchemaColumnConfigContext.Provider value={config}>
      <div className="page-el-attrs-columns">
        <TableWrap
          enableDoHeader
          disabledColumnConfig={false}
        >
          <Table
            key={config.tableRenderKey}
            className="do-inner-scroller page-table"
            size="middle"
            rowKey="id"
            loading={tableLoading}
            columns={columns}
            dataSource={tableData}
            pagination={false}
            scroll={{ x: true, y: maxHeight }}
          />
        </TableWrap>
        <DoConfigColumnDialog />
      </div>
    </SchemaColumnConfigContext.Provider>
  );
}
