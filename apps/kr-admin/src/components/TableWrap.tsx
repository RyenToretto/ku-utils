import { DoTableHeader } from '@ku-utils/r-custom-columns';
import type { ReactNode } from 'react';

export type TableWrapProps = {
  /** 与 kv3 一致：挂载 DoTableHeader（batch 左 / 自定义列右） */
  enableDoHeader?: boolean;
  /** true 时隐藏「自定义列」按钮（学校列表等默认 true） */
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
 * 列表表格外壳：与 kv3 TableWrap 对齐。
 * enableDoHeader 时内置 DoTableHeader；自定义列页设 disabledColumnConfig={false}。
 */
export function TableWrap({
  enableDoHeader = false,
  disabledColumnConfig = true,
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
      {enableDoHeader ? (
        <DoTableHeader
          disabled={disabledColumnConfig}
          // workspace 内 @types/react 大版本差导致 ReactNode 名义不兼容，运行时一致
          batch={batch as never}
          control={control as never}
        />
      ) : null}

      {!enableDoHeader && header ? <div className="table-wrap-hd">{header}</div> : null}

      <div className="table-wrap-bd">{children}</div>
      {footer ? <div className="table-wrap-ft">{footer}</div> : null}
    </div>
  );
}

export default TableWrap;
