import {
  useSchemaColumnConfig,
  DoTableHeader,
  DoConfigColumnDialog,
  schemasToColumns,
  SchemaColumnConfigContext,
  type ColumnSchema,
} from '@ku-utils/r-custom-columns';
import { Table } from 'antd';

const BASE_SCHEMAS: ColumnSchema[] = [
  { prop: 'id', label: 'ID', width: 80, fixed: 'left', isDefault: true },
  { prop: 'name', label: '名称', isDefault: true, showOverflowTooltip: true },
  { prop: 'groupA', label: '分组A', group: '指标', isDefault: true },
  { prop: 'groupB', label: '分组B', group: '指标' },
  { prop: 'amount', label: '金额', align: 'right', isDefault: true },
  { prop: 'rate', label: '比率', align: 'right' },
  { prop: 'status', label: '状态', isDefault: true },
  { prop: 'remark', label: '备注' },
];

const NESTED: ColumnSchema[] = [
  { prop: 'id', label: 'ID', width: 80, isDefault: true },
  {
    label: '嵌套表头',
    children: [
      { prop: 'name', label: '名称', isDefault: true },
      { prop: 'amount', label: '金额', isDefault: true },
    ],
  },
];

const DATA = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: `示例 ${i + 1}`,
  groupA: 10 + i,
  groupB: 20 + i,
  amount: 1000 * (i + 1),
  rate: `${(i + 1) * 3}%`,
  status: i % 2 ? '启用' : '停用',
  remark: '备注',
}));

export default function CustomColumnsDemo({
  title,
  mode = 'basic',
}: {
  title: string;
  mode?: 'basic' | 'nested' | 'fixed' | 'version' | 'slots';
}) {
  const schemas =
    mode === 'nested'
      ? NESTED
      : mode === 'fixed'
        ? BASE_SCHEMAS.map((s) => (s.prop === 'name' ? { ...s, fixed: 'left' as const } : s))
        : BASE_SCHEMAS;

  const config = useSchemaColumnConfig({
    columnSchemas: schemas,
    storageKey: `kr_cc_${mode}`,
    schemaVersion: mode === 'version' ? 2 : 1,
  });

  const columns = schemasToColumns(config.visibleSchemas);

  return (
    <SchemaColumnConfigContext.Provider value={config}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <DoTableHeader />
        <div style={{ opacity: 0.65, fontSize: 12 }}>{title} · 自定义列</div>
        <Table
          key={config.tableRenderKey}
          size="middle"
          rowKey="id"
          columns={columns}
          dataSource={DATA}
          pagination={false}
          scroll={{ x: true }}
        />
        <DoConfigColumnDialog />
      </div>
    </SchemaColumnConfigContext.Provider>
  );
}
