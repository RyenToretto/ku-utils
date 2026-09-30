import {
  useSchemaColumnConfig,
  DoConfigColumnDialog,
  DoTableHeader,
  schemasToColumns,
  SchemaColumnConfigContext,
} from '@ku-utils/r-custom-columns';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';

import TableWrap from '@/components/TableWrap';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import {
  BASIC_COLUMN_SCHEMAS,
  DEMO_CUSTOM_COLUMN_MESSAGES,
  NESTED_COLUMN_SCHEMAS,
  SCHEMA_FIXED_COLUMN_SCHEMAS,
  VERSION_COLUMN_SCHEMAS,
} from '@/modules/_example/customColumns/_utils/demoSchemas';
import {
  useCustomColumnsDemoData,
  type DemoRow,
} from '@/modules/_example/customColumns/_utils/useCustomColumnsDemoData';

export type CustomColumnsDemoMode = 'basic' | 'nested' | 'version' | 'fixed';

function resolveSchemas(mode: CustomColumnsDemoMode) {
  switch (mode) {
    case 'nested':
      return NESTED_COLUMN_SCHEMAS;
    case 'version':
      return VERSION_COLUMN_SCHEMAS;
    case 'fixed':
      return SCHEMA_FIXED_COLUMN_SCHEMAS;
    case 'basic':
    default:
      return BASIC_COLUMN_SCHEMAS;
  }
}

function mapVersionRow(row: DemoRow): DemoRow {
  return { ...row, cvtRate: row.rate };
}

export default function CustomColumnsDemo({
  title: _title,
  mode = 'basic',
}: {
  title: string;
  mode?: CustomColumnsDemoMode;
}) {
  void _title;
  const pageClass = `page-custom-columns-${mode}`;
  const maxHeight = useAdminTableMaxHeight(`.${pageClass}`, 400);
  const { tableLoading, tableData } = useCustomColumnsDemoData();
  const columnSchemas = resolveSchemas(mode);
  const [sortedInfo, setSortedInfo] = useState<{
    field?: string;
    order?: 'ascend' | 'descend';
  }>({});

  const config = useSchemaColumnConfig({
    columnSchemas,
    storageKey: `kr-example-${mode}`,
    schemaVersion: mode === 'version' ? 2 : 1,
    messages: DEMO_CUSTOM_COLUMN_MESSAGES,
  });

  const rows = useMemo(() => {
    const base = mode === 'version' ? tableData.map(mapVersionRow) : tableData;
    if (!sortedInfo.field || !sortedInfo.order) return base;
    const prop = sortedInfo.field;
    const factor = sortedInfo.order === 'ascend' ? 1 : -1;
    return [...base].sort((a, b) => {
      const av = Number(a[prop] ?? 0);
      const bv = Number(b[prop] ?? 0);
      return (av - bv) * factor;
    });
  }, [mode, sortedInfo.field, sortedInfo.order, tableData]);

  const schemaColumns = schemasToColumns<DemoRow>(config.visibleSchemas, {
    formatCell: config.formatSchemaCell,
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
    ...schemaColumns,
    ...(mode === 'fixed'
      ? [
          {
            title: '操作',
            key: 'ops',
            width: 90,
            fixed: 'right' as const,
            render: () => <a>详情</a>,
          },
        ]
      : []),
  ];

  return (
    <SchemaColumnConfigContext.Provider value={config}>
      <div className={pageClass}>
        <TableWrap
          enableDoHeader
          control={<DoTableHeader />}
        >
          <Table
            key={config.tableRenderKey}
            className="do-inner-scroller page-table hide-table-border"
            size="middle"
            rowKey="id"
            loading={tableLoading}
            columns={columns}
            dataSource={rows}
            pagination={false}
            bordered
            scroll={{ x: true, y: maxHeight }}
            onChange={(_p, _f, sorter) => {
              const one = Array.isArray(sorter) ? sorter[0] : sorter;
              const field = String(one?.field || one?.columnKey || '');
              setSortedInfo({
                field: field || undefined,
                order: one?.order || undefined,
              });
            }}
          />
        </TableWrap>
        <DoConfigColumnDialog />
      </div>
    </SchemaColumnConfigContext.Provider>
  );
}
