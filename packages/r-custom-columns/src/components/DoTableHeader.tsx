import { Button } from 'antd';
import type { CSSProperties, ReactNode } from 'react';

import { useOptionalSchemaColumnConfigContext } from '../context';
import { DEFAULT_CUSTOM_COLUMN_MESSAGES } from '../useSchemaColumnConfig';

export interface DoTableHeaderProps {
  /** 打开配置弹窗；不传则尝试从 Context 读取 openConfig */
  onOpen?: () => void;
  /** 按钮文案；不传则用 messages.customColumns */
  label?: string;
  /** 禁用自定义列按钮 */
  disabled?: boolean;
  /** 左侧批量操作区 */
  batch?: ReactNode;
  /** 右侧额外控件（自定义列按钮左侧） */
  control?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * 表格工具栏：左侧 batch、右侧 control +「自定义列」按钮。
 */
export function DoTableHeader(props: DoTableHeaderProps) {
  const ctx = useOptionalSchemaColumnConfigContext();
  const {
    onOpen = ctx?.openConfig,
    label = ctx?.messages.customColumns ?? DEFAULT_CUSTOM_COLUMN_MESSAGES.customColumns,
    disabled = false,
    batch,
    control,
    className,
    style,
  } = props;

  return (
    <div
      className={['do-table-header', className].filter(Boolean).join(' ')}
      style={style}
    >
      <div className="table-batch">{batch}</div>
      <div className="table-control">
        {control}
        {!disabled && (
          <Button
            className="do-table-control-btn"
            size="small"
            onClick={() => onOpen?.()}
          >
            {label}
          </Button>
        )}
      </div>
    </div>
  );
}
