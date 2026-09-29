import { Tooltip } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import type { ReactNode } from 'react';

import type { ColumnSchema } from '../types';

export interface SchemaToColumnOptions {
  formatCell?: (val: unknown, schema: ColumnSchema) => string;
}

function resolveCellValue(
  value: unknown,
  schema: ColumnSchema,
  formatCell?: (val: unknown, schema: ColumnSchema) => string,
): string {
  if (formatCell) return formatCell(value, schema);
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
}

/**
 * 将单个 ColumnSchema 转为 Ant Design Table ColumnType。
 * 支持嵌套 children。
 */
export function schemaToColumn<T extends Record<string, unknown> = Record<string, unknown>>(
  schema: ColumnSchema,
  options: SchemaToColumnOptions = {},
): ColumnType<T> {
  const { formatCell } = options;

  if (schema.children && schema.children.length) {
    return {
      title: schema.label,
      align: schema.align || 'center',
      children: schema.children.map((child) => schemaToColumn<T>(child, options)),
      ...schema.antdAttrs,
    } as ColumnType<T>;
  }

  const titleNode: ReactNode = schema.renderHeader ? (
    schema.renderHeader(schema)
  ) : schema.headerTooltip ? (
    <Tooltip title={schema.headerTooltip}>
      <span className="schema-col-header-tip">{schema.label}</span>
    </Tooltip>
  ) : (
    schema.label
  );

  const fixed =
    schema.fixed === true ? ('left' as const) : schema.fixed === false ? undefined : schema.fixed;

  return {
    key: schema.prop || schema.label,
    dataIndex: schema.prop,
    title: titleNode,
    width: schema.width ?? schema.minWidth,
    align: schema.align || 'left',
    fixed,
    sorter: schema.sortable ? true : undefined,
    ellipsis: schema.showOverflowTooltip ? { showTitle: true } : undefined,
    render: (value: unknown, record: T, index: number) => {
      if (schema.cellRender) {
        return schema.cellRender({
          value,
          record: record as Record<string, unknown>,
          index,
          schema,
        });
      }
      return resolveCellValue(value, schema, formatCell);
    },
    ...schema.antdAttrs,
  };
}

/**
 * 将 schema 数组批量转为 Ant Design Table columns。
 */
export function schemasToColumns<T extends Record<string, unknown> = Record<string, unknown>>(
  schemas: ColumnSchema[],
  options: SchemaToColumnOptions = {},
): ColumnsType<T> {
  return (schemas || []).map((schema) => schemaToColumn<T>(schema, options));
}

/** @deprecated 使用 schemasToColumns；保留别名便于迁移 */
export const SchemaColumn = schemasToColumns;
