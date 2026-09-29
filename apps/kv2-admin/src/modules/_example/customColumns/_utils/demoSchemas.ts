/** 本地 schema 类型（v2-custom-columns 未导出 TS 类型） */
export type ColumnSchema = {
  prop?: string;
  label: string;
  minWidth?: number;
  align?: string;
  sortable?: boolean;
  renderType?: string;
  renderArgs?: unknown[];
  group?: string;
  isDefault?: boolean;
  children?: ColumnSchema[];
  [key: string]: unknown;
};

export type CustomColumnMessages = Record<string, string | ((...args: never[]) => string)>;

export const DEMO_CUSTOM_COLUMN_MESSAGES: CustomColumnMessages = {
  customColumns: '自定义列',
  searchPlaceholder: '搜索列名',
  selectAll: '全选',
  invertSelection: '反选',
  emptySearch: '未找到匹配列',
  selectedCount: ((selected: number, max: number) => `已选择 ${selected}/${max} 列`) as never,
  reset: '重置',
  fixedColumnsTip: '固定列不可取消',
  emptySelected: '请至少选择一列',
  configNamePlaceholder: '请输入配置名称',
  cancel: '取消',
  save: '保存',
  saveToLocal: '保存到本地',
  readFromLocal: '读取本地配置',
  complete: '完成',
  customConfig: '自定义配置',
  defaultConfigLabel: '默认配置',
  noNameLabel: '未命名配置',
  groupFallback: '未分组',
  operationColumnLabel: '操作',
  maxSelectedWarning: ((max: number) => `最多选择 ${max} 列`) as never,
  configNameRequired: '请输入配置名称',
  configNameExists: '配置名称已存在',
  configSaved: '配置已保存',
};

export const BASIC_COLUMN_SCHEMAS: ColumnSchema[] = [
  {
    prop: 'amount',
    label: '数量',
    minWidth: 100,
    align: 'right',
    sortable: true,
    renderType: 'integer',
    group: '数值指标',
    isDefault: true,
  },
  {
    prop: 'score',
    label: '评分',
    minWidth: 100,
    align: 'right',
    sortable: true,
    renderType: 'integer',
    group: '数值指标',
    isDefault: true,
  },
  {
    prop: 'cost',
    label: '成本',
    minWidth: 110,
    align: 'right',
    sortable: true,
    renderType: 'float',
    renderArgs: [2, true],
    group: '金额指标',
    isDefault: true,
  },
  {
    prop: 'roi',
    label: 'ROI',
    minWidth: 100,
    align: 'right',
    sortable: true,
    renderType: 'float',
    renderArgs: [2, false],
    group: '金额指标',
    isDefault: true,
  },
  {
    prop: 'rate',
    label: '转化率',
    minWidth: 100,
    align: 'right',
    sortable: true,
    renderType: 'percent',
    renderArgs: [1, true],
    group: '比率',
    isDefault: true,
  },
];

export const NESTED_COLUMN_SCHEMAS: ColumnSchema[] = BASIC_COLUMN_SCHEMAS;
export const VERSION_COLUMN_SCHEMAS: ColumnSchema[] = BASIC_COLUMN_SCHEMAS;
export const SCHEMA_FIXED_COLUMN_SCHEMAS: ColumnSchema[] = BASIC_COLUMN_SCHEMAS;
export const EL_ATTRS_COLUMN_SCHEMAS = BASIC_COLUMN_SCHEMAS;
export const SLOTS_COLUMN_SCHEMAS = BASIC_COLUMN_SCHEMAS;
export const SLOT_COMPONENTS_COLUMN_SCHEMAS = BASIC_COLUMN_SCHEMAS;
export const HEADER_SLOTS_COLUMN_SCHEMAS = BASIC_COLUMN_SCHEMAS;
export const FIXED_COLS_COLUMN_SCHEMAS = SCHEMA_FIXED_COLUMN_SCHEMAS;
