import { Button, Popover } from 'antd';
import { useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { useOptionalSchemaColumnConfigContext } from '../context';
import type { ColumnConfig } from '../types';
import { DEFAULT_CUSTOM_COLUMN_MESSAGES } from '../useSchemaColumnConfig';

import { DoConfigColumnDialog } from './DoConfigColumnDialog';
import type { DoConfigColumnDialogRef } from './DoConfigColumnDialog';
import { DoReadColumnConfig } from './DoReadColumnConfig';

export interface DoTableHeaderProps {
  /** 隐藏「自定义列」入口，默认 true */
  disabledColumnConfig?: boolean;
  /** 左侧批量操作区 */
  batch?: ReactNode;
  /** 右侧额外控件（自定义列按钮左侧） */
  control?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * 表格工具栏：左侧 batch、右侧 control +「自定义列」。
 * 悬停「自定义列」列出本地配置，「自定义配置」打开配置抽屉；需在 SchemaColumnConfigContext 内使用。
 */
export function DoTableHeader(props: DoTableHeaderProps) {
  const { disabledColumnConfig = true, batch, control, className, style } = props;
  const ctx = useOptionalSchemaColumnConfigContext();
  const messages = ctx?.messages ?? DEFAULT_CUSTOM_COLUMN_MESSAGES;
  const [popoverOpen, setPopoverOpen] = useState(false);
  const dialogRef = useRef<DoConfigColumnDialogRef>(null);

  const applyColumnConfig = (config: ColumnConfig) => ctx?.applyColumnConfig(config);

  return (
    <div
      className={['do-table-header', className].filter(Boolean).join(' ')}
      style={style}
    >
      {ctx ? (
        <DoConfigColumnDialog
          ref={dialogRef}
          onConfirm={applyColumnConfig}
        />
      ) : null}

      <div className="table-batch">{batch}</div>
      <div className="table-control">
        {control}
        {!disabledColumnConfig ? (
          <Popover
            open={popoverOpen}
            onOpenChange={setPopoverOpen}
            placement="bottom"
            trigger="hover"
            mouseEnterDelay={0}
            mouseLeaveDelay={0.2}
            rootClassName="do-table-config-popper"
            content={
              <DoReadColumnConfig
                disabledDelete
                showCustomConfigButton
                onConfirm={applyColumnConfig}
                onRemove={(label) => ctx?.removeConfigFromLocal(label)}
                onCustom={(config) => {
                  setPopoverOpen(false);
                  dialogRef.current?.showConfigColumnDialog(config);
                }}
                onClosed={() => setPopoverOpen(false)}
              />
            }
          >
            <Button
              className="do-table-control-btn"
              size="small"
            >
              {messages.customColumns}
            </Button>
          </Popover>
        ) : null}
      </div>
    </div>
  );
}
