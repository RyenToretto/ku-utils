import './style.css';

export { useSchemaColumnConfig, DEFAULT_CUSTOM_COLUMN_MESSAGES } from './useSchemaColumnConfig';
export type { SchemaColumnConfigReturn } from './useSchemaColumnConfig';

export {
  SchemaColumnConfigContext,
  useSchemaColumnConfigContext,
  useOptionalSchemaColumnConfigContext,
} from './context';

export { DoTableHeader } from './components/DoTableHeader';
export type { DoTableHeaderProps } from './components/DoTableHeader';

export { DoConfigColumnDialog } from './components/DoConfigColumnDialog';
export type { DoConfigColumnDialogProps } from './components/DoConfigColumnDialog';

export { schemaToColumn, schemasToColumns, SchemaColumn } from './components/SchemaColumn';
export type { SchemaToColumnOptions } from './components/SchemaColumn';

/** @deprecated 使用 schemasToColumns */
export { schemasToColumns as schemasToAntdColumns } from './components/SchemaColumn';

export type {
  ColumnSchema,
  ColumnRenderType,
  ColumnConfig,
  TableStorage,
  TableColumnMeta,
  AlwaysVisibleColumn,
  CustomColumnMessages,
  SchemaColumnConfigOptions,
} from './types';
