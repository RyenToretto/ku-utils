import {
  useSchemaColumnConfig,
  DoConfigColumnDialog,
  schemasToColumns,
  SchemaColumnConfigContext,
  type ColumnSchema,
} from '@ku-utils/r-custom-columns';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo } from 'react';

import TableWrap from '@/components/TableWrap';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import {
  BASIC_COLUMN_SCHEMAS,
  DEMO_CUSTOM_COLUMN_MESSAGES,
} from '@/modules/_example/customColumns/_utils/demoSchemas';
import {
  useCustomColumnsDemoData,
  type DemoRow,
} from '@/modules/_example/customColumns/_utils/useCustomColumnsDemoData';

export default function SlotsColumns() {
  const maxHeight = useAdminTableMaxHeight('.page-slots-columns', 400);
  const { tableLoading, tableData } = useCustomColumnsDemoData();

  const config = useSchemaColumnConfig({
    columnSchemas: BASIC_COLUMN_SCHEMAS,
    storageKey: 'kr-example-slots',
    schemaVersion: 1,
    messages: DEMO_CUSTOM_COLUMN_MESSAGES,
  });

  const visibleWithSlots = useMemo<ColumnSchema[]>(
    () =>
      config.visibleSchemas.map((schema) =>
        schema.prop === 'roi'
          ? {
              ...schema,
              cellRender: ({ value, record, schema: s }) => (
                <span className={Number(record.roi) >= 1.8 ? 'roi-high' : 'roi-normal'}>
                  {config.formatSchemaCell(value, s)}
                </span>
              ),
            }
          : schema,
      ),
    [config],
  );

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
    ...schemasToColumns<DemoRow>(visibleWithSlots, {
      formatCell: config.formatSchemaCell,
    }),
  ];

  return (
    <SchemaColumnConfigContext.Provider value={config}>
      <div className="page-slots-columns">
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
