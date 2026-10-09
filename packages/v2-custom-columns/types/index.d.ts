import type Vue from 'vue';
import type { Component, ComponentOptions, PluginObject, VNode } from 'vue';

/** 单元格渲染类型（formatSchemaCell 内置格式化） */
export type ColumnRenderType = 'text' | 'integer' | 'float' | 'percent';

/** 列 schema 定义（与 @ku-utils/custom-columns 同构） */
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
  renderType?: ColumnRenderType;
  /** float/percent: [digits, noZero] */
  renderArgs?: unknown[];
  /** 自定义单元格组件，props: { row, column, index, schema } */
  cellComponent?: Component;
  /** 列头渲染：(h, { column, $index }) => VNode（SchemaColumn 经 #header 插槽调用） */
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

/** 硬编码固定列声明 */
export interface AlwaysVisibleColumn {
  prop: string;
  label: string;
}

/** mixin 读取的 data() 字段（消费方覆盖） */
export interface SchemaColumnConfigData {
  columnSchemas: ColumnSchema[];
  /** localStorage 基础 key，页面唯一 */
  schemaStorageKey: string;
  /** 从 1 开始；字段重命名/删除时递增 */
  schemaVersion: number;
  alwaysVisibleColumns: AlwaysVisibleColumn[];
  /** 用户自定义配置上限，默认 10 */
  maxConfigCount: number;
  /** 可选列数量上限，默认 50 */
  maxSelectCount: number;
  /** 弹窗取消/关闭回调 */
  onDialogClose: (() => void) | null;
}

/** Options API mixin：provide('crud', this)，DoTableHeader 由此读写配置 */
export declare const useSchemaColumnConfig: ComponentOptions<Vue>;
/** 仅服务旧 tableControl 迁移，新页面禁用 */
export declare const ElementTableColumnAdapter: ComponentOptions<Vue>;

export declare const DoTableHeader: Component;
export declare const DoConfigColumnDialog: Component;
export declare const DoReadColumnConfig: Component;
/** 递归渲染 schema（含 children 嵌套表头），props: { schema, formatCell } */
export declare const SchemaColumn: Component;

export declare function transferTF(str: unknown): string;

declare const plugin: PluginObject<undefined>;
export default plugin;
