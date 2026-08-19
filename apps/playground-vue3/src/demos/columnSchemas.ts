import type { ColumnSchema, CustomColumnMessages } from '@ku-utils/custom-columns';

export const PLAYGROUND_COLUMN_MESSAGES: CustomColumnMessages = {
  customColumns: '自定义列',
  searchPlaceholder: '搜索列名',
  selectAll: '全选',
  invertSelection: '反选',
  emptySearch: '未找到匹配列',
  selectedCount: (selected, max) => `已选择 ${selected}/${max} 列`,
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
  maxSelectedWarning: (max) => `最多选择 ${max} 列`,
  configNameRequired: '请输入配置名称',
  configNameExists: '配置名称已存在',
  configSaved: '配置已保存',
};

export const PLAYGROUND_COLUMN_SCHEMAS: ColumnSchema[] = [
  {
    prop: 'amount',
    label: '数量',
    minWidth: 100,
    align: 'right',
    renderType: 'integer',
    group: '数值',
    isDefault: true,
  },
  {
    prop: 'cost',
    label: '成本',
    minWidth: 110,
    align: 'right',
    renderType: 'float',
    renderArgs: [2, true],
    group: '金额',
    isDefault: true,
  },
  {
    prop: 'rate',
    label: '转化率',
    minWidth: 100,
    align: 'right',
    renderType: 'percent',
    renderArgs: [1, true],
    group: '金额',
    isDefault: true,
  },
];

export const PLAYGROUND_TABLE_ROWS = [
  { id: 1, name: 'Campaign A', amount: 1280, cost: 320.5, rate: 0.126 },
  { id: 2, name: 'Campaign B', amount: 860, cost: 118, rate: 0.084 },
  { id: 3, name: 'Campaign C', amount: 0, cost: 56.2, rate: 0.031 },
];
