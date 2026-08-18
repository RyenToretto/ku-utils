import type { Component, VNode } from 'vue';

/** 单元格渲染类型 */
export type ColumnRenderType = 'text' | 'integer' | 'float' | 'percent';

/** 列 schema 定义 */
export interface ColumnSchema {
  /** 叶子列必填，全局唯一且稳定（用于配置存储与 v-for :key） */
  prop?: string;
  /** 列头文字 */
  label: string;
  /** 弹窗左侧分组名，默认「未分组」 */
  group?: string;
  minWidth?: number;
  width?: number;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean | 'custom';
  /** 固定列，弹窗中不可取消 */
  fixed?: boolean | 'left' | 'right';
  /** 首次进入默认显示（无缓存时优先于全量） */
  isDefault?: boolean;
  /** 不纳入可配置范围（写在 v-for 外，一般不放进 schemas） */
  alwaysVisible?: boolean;
  /** 单元格格式化类型 */
  renderType?: ColumnRenderType;
  /** float/percent: [digits, noZero] */
  renderArgs?: unknown[];
  /** 自定义单元格组件，props: { row, column, index, schema } */
  cellComponent?: Component;
  /** 自定义列头渲染函数 */
  renderHeader?: (...args: unknown[]) => VNode;
  /** 列头 tooltip 文案 */
  headerTooltip?: string;
  /** 超长省略 tooltip */
  showOverflowTooltip?: boolean;
  /** 透传任意 el-table-column 原生属性 */
  elAttrs?: Record<string, unknown>;
  /** 嵌套表头子列 */
  children?: ColumnSchema[];
}

/** 单套列配置 */
export interface ColumnConfig {
  label: string;
  /** 可见列的 prop 数组；空数组或含 'ALL' 视为全量可见 */
  columns: string[];
}

/** localStorage 持久化结构 */
export interface TableStorage {
  activeColumnConfigLabel: string;
  columnConfig: ColumnConfig[];
}

export interface CustomColumnMessages {
  customColumns: string;
  searchPlaceholder: string;
  selectAll: string;
  invertSelection: string;
  emptySearch: string;
  selectedCount: (selected: number, max: number) => string;
  reset: string;
  fixedColumnsTip: string;
  emptySelected: string;
  configNamePlaceholder: string;
  cancel: string;
  save: string;
  saveToLocal: string;
  readFromLocal: string;
  complete: string;
  customConfig: string;
  defaultConfigLabel: string;
  noNameLabel: string;
  groupFallback: string;
  operationColumnLabel: string;
  maxSelectedWarning: (max: number) => string;
  configNameRequired: string;
  configNameExists: string;
  configSaved: string;
}

/** 弹窗内部使用的扁平列元数据 */
export interface TableColumnMeta {
  property?: string;
  label: string;
  fixed: boolean;
  group: string;
  isLeaf: boolean;
  visible: boolean;
  /** 硬编码固定列标记 */
  _alwaysVisible?: boolean;
  type?: string;
}

/** 硬编码固定列声明 */
export interface AlwaysVisibleColumn {
  prop: string;
  label: string;
}

/** useSchemaColumnConfig 入参 */
export interface SchemaColumnConfigOptions {
  /** 可配置列 schema 数组 */
  columnSchemas: ColumnSchema[];
  /** localStorage 基础 key，全局唯一 */
  storageKey?: string;
  /** schema 版本号，破坏性变更（rename/delete prop）时递增 */
  schemaVersion?: number;
  /** 硬编码固定列声明 */
  alwaysVisibleColumns?: AlwaysVisibleColumn[];
  /** 用户自定义配置上限，默认 10 */
  maxConfigCount?: number;
  /** 可选列数量上限，默认 50 */
  maxSelectCount?: number;
  /** 默认配置名称，默认「默认配置」 */
  defaultConfigLabel?: string;
  /** 未命名配置名称，默认「未命名配置」 */
  noNameLabel?: string;
  /** 组件内置 UI 文案；未传时默认英文 */
  messages?: Partial<CustomColumnMessages>;
  /** 弹窗取消/关闭回调 */
  onDialogClose?: (() => void) | null;
  /** 激活配置 label 变化回调 */
  onLabelChange?: ((label: string) => void) | null;
}

/** provide/inject 的 crud 契约 */
export interface CrudContext {
  tableColumns: TableColumnMeta[];
  visibleSchemas: ColumnSchema[];
  tableRenderKey: string;
  maxSelectCount: number;
  noNameLabel: string;
  messages: CustomColumnMessages;
  alwaysVisibleColumns: AlwaysVisibleColumn[];
  onDialogClose: (() => void) | null;

  readCacheConfig: () => TableStorage | null;
  getDefaultConfig: () => ColumnConfig | null;
  existAlreadyWithSystem: (label: string) => boolean;
  applyColumnConfig: (config: ColumnConfig) => void;
  saveConfigToLocal: (name: string, columns: string[]) => void;
  removeConfigFromLocal: (label: string) => void;
  formatSchemaCell: (val: unknown, schema: ColumnSchema) => string;
}
