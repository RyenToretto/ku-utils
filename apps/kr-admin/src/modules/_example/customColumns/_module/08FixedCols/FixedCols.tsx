import {
  DoConfigColumnDialog,
  SchemaColumnConfigContext,
  schemasToColumns,
  useSchemaColumnConfig,
} from '@ku-utils/r-custom-columns';
import { Button, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import TableWrap from '@/components/TableWrap';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { useFlexColumns } from '@/composables/useFlexColumns';
import {
  DEMO_CUSTOM_COLUMN_MESSAGES,
  SCHEMA_FIXED_COLUMN_SCHEMAS,
} from '@/modules/_example/customColumns/_utils/demoSchemas';
import {
  useCustomColumnsDemoData,
  type DemoRow,
} from '@/modules/_example/customColumns/_utils/useCustomColumnsDemoData';

export default function FixedCols() {
  const { tableLoading, tableData } = useCustomColumnsDemoData();
  const maxHeight = useAdminTableMaxHeight('.page-fixed-cols', 400);

  const config = useSchemaColumnConfig({
    columnSchemas: SCHEMA_FIXED_COLUMN_SCHEMAS,
    storageKey: 'kr-example-fixed-cols',
    schemaVersion: 2,
    messages: DEMO_CUSTOM_COLUMN_MESSAGES,
    alwaysVisibleColumns: [
      { prop: 'id', label: 'ID' },
      { prop: 'name', label: '名称' },
    ],
  });

  const columns: ColumnsType<DemoRow> = [
    { title: 'ID', dataIndex: 'id', width: 70, fixed: 'left', align: 'center' },
    { title: '名称', dataIndex: 'name', minWidth: 140, fixed: 'left' },
    ...schemasToColumns<DemoRow>(config.visibleSchemas, { formatCell: config.formatSchemaCell }),
    {
      title: '操作',
      key: 'ops',
      width: 100,
      fixed: 'right',
      className: 'ops-column',
      render: () => (
        <Button
          size="small"
          color="primary"
          variant="outlined"
        >
          详情
        </Button>
      ),
    },
  ];
  const flexColumns = useFlexColumns(columns, '.page-fixed-cols');

  return (
    <SchemaColumnConfigContext.Provider value={config}>
      <div className="page-fixed-cols">
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
            columns={flexColumns}
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
