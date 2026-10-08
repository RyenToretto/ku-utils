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

import BadgeHeader from './headers/BadgeHeader';
import TrendHeader from './headers/TrendHeader';

import TableWrap from '@/components/TableWrap';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { DEMO_CUSTOM_COLUMN_MESSAGES } from '@/modules/_example/customColumns/_utils/demoSchemas';
import {
  useCustomColumnsDemoData,
  type DemoRow,
} from '@/modules/_example/customColumns/_utils/useCustomColumnsDemoData';

export default function HeaderSlots() {
  const maxHeight = useAdminTableMaxHeight('.page-header-slots', 400);
  const { tableLoading, tableData } = useCustomColumnsDemoData();

  const columnSchemas = useMemo<ColumnSchema[]>(
    () => [
      {
        prop: 'amount',
        label: '数量',
        minWidth: 110,
        align: 'right',
        renderType: 'integer',
        headerTooltip: '投放量（headerTooltip）',
        isDefault: true,
      },
      {
        prop: 'score',
        label: '评分',
        minWidth: 120,
        align: 'right',
        renderType: 'integer',
        renderHeader: () => <TrendHeader label="评分" />,
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
      {
        prop: 'roi',
        label: 'ROI',
        minWidth: 100,
        align: 'right',
        renderType: 'float',
        isDefault: true,
      },
    ],
    [],
  );

  const config = useSchemaColumnConfig({
    columnSchemas,
    storageKey: 'kr-example-header-slots',
    schemaVersion: 2,
    messages: DEMO_CUSTOM_COLUMN_MESSAGES,
  });

  const visibleWithHeaders = useMemo<ColumnSchema[]>(
    () =>
      config.visibleSchemas.map((schema) => {
        if (schema.prop === 'score') {
          return {
            ...schema,
            renderHeader: () => <TrendHeader label="评分" />,
          };
        }
        if (schema.prop === 'cost') {
          return {
            ...schema,
            renderHeader: (s) => <BadgeHeader label={s.label} />,
          };
        }
        if (schema.prop === 'roi') {
          return {
            ...schema,
            renderHeader: (s) => <TrendHeader label={s.label} />,
          };
        }
        return schema;
      }),
    [config.visibleSchemas],
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
    ...schemasToColumns<DemoRow>(visibleWithHeaders, {
      formatCell: config.formatSchemaCell,
    }),
  ];

  return (
    <SchemaColumnConfigContext.Provider value={config}>
      <div className="page-header-slots">
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
