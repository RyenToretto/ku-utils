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

import AmountCell from './cells/AmountCell';
import RatingCell from './cells/RatingCell';

import TableWrap from '@/components/TableWrap';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { DEMO_CUSTOM_COLUMN_MESSAGES } from '@/modules/_example/customColumns/_utils/demoSchemas';
import {
  useCustomColumnsDemoData,
  type DemoRow,
} from '@/modules/_example/customColumns/_utils/useCustomColumnsDemoData';

export default function SlotComponents() {
  const maxHeight = useAdminTableMaxHeight('.page-slot-components', 400);
  const { tableLoading, tableData } = useCustomColumnsDemoData();

  const columnSchemas = useMemo<ColumnSchema[]>(
    () => [
      {
        prop: 'amount',
        label: '数量',
        minWidth: 120,
        align: 'right',
        isDefault: true,
        cellRender: ({ record, schema }) => (
          <AmountCell
            row={record}
            prop={schema.prop}
          />
        ),
      },
      {
        prop: 'score',
        label: '评分',
        minWidth: 160,
        align: 'center',
        isDefault: true,
        cellRender: ({ record }) => <RatingCell row={record} />,
      },
      {
        prop: 'roi',
        label: 'ROI',
        minWidth: 100,
        align: 'right',
        renderType: 'float',
        isDefault: true,
      },
      {
        prop: 'cost',
        label: '成本',
        minWidth: 110,
        align: 'right',
        renderType: 'float',
        isDefault: true,
      },
    ],
    [],
  );

  const config = useSchemaColumnConfig({
    columnSchemas,
    storageKey: 'kr-example-slot-components',
    schemaVersion: 2,
    messages: DEMO_CUSTOM_COLUMN_MESSAGES,
  });

  const visibleWithSlots = useMemo<ColumnSchema[]>(
    () =>
      config.visibleSchemas.map((schema) => {
        if (schema.prop === 'roi') {
          return {
            ...schema,
            cellRender: ({ value, record, schema: s }) => (
              <span className={Number(record.roi) >= 1.8 ? 'roi-high' : 'roi-normal'}>
                {config.formatSchemaCell(value, s)}
              </span>
            ),
          };
        }
        const origin = columnSchemas.find((s) => s.prop === schema.prop);
        return origin?.cellRender ? { ...schema, cellRender: origin.cellRender } : schema;
      }),
    [columnSchemas, config],
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
      <div className="page-slot-components">
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
