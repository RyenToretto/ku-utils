import type { ReactNode } from 'react';

export type TableWrapProps = {
  enableDoHeader?: boolean;
  disabledColumnConfig?: boolean;
  ariaLabel?: string;
  batch?: ReactNode;
  control?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
};

/**
 * 列表表格外壳：batch / header / 表体 / footer（分页）。
 * 自定义列时由页面自行挂 DoTableHeader（enableDoHeader 仅作语义标记）。
 */
export function TableWrap({
  ariaLabel = '数据表格',
  batch,
  control,
  header,
  footer,
  children,
  className,
}: TableWrapProps) {
  return (
    <div
      className={['table-wrap', className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
    >
      {(batch || control || header) && (
        <div className="table-wrap-hd">
          {header}
          {(batch || control) && (
            <div className="table-wrap-toolbar">
              {batch ? <div className="table-wrap-batch">{batch}</div> : null}
              {control ? <div className="table-wrap-control">{control}</div> : null}
            </div>
          )}
        </div>
      )}
      <div className="table-wrap-bd">{children}</div>
      {footer ? <div className="table-wrap-ft">{footer}</div> : null}
    </div>
  );
}

export default TableWrap;
