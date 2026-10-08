import { CloseOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import { useOptionalSchemaColumnConfigContext } from '../context';
import type { ColumnConfig } from '../types';
import { DEFAULT_CUSTOM_COLUMN_MESSAGES } from '../useSchemaColumnConfig';

export interface DoReadColumnConfigProps {
  /** 隐藏用户配置的删除按钮 */
  disabledDelete?: boolean;
  /** 隐藏「取消」按钮，默认 true */
  disabledCancelButton?: boolean;
  /** 显示「自定义配置」按钮 */
  showCustomConfigButton?: boolean;
  onConfirm?: (config: ColumnConfig) => void;
  onRemove?: (label: string) => void;
  /** 点击「自定义配置」，携带当前激活配置 */
  onCustom?: (config: ColumnConfig | undefined) => void;
  onClosed?: () => void;
}

/**
 * 本地配置列表：激活项高亮，其余半透明；悬停非系统配置时显示删除。
 */
export function DoReadColumnConfig(props: DoReadColumnConfigProps) {
  const {
    disabledDelete = false,
    disabledCancelButton = true,
    showCustomConfigButton = false,
    onConfirm,
    onRemove,
    onCustom,
    onClosed,
  } = props;
  const ctx = useOptionalSchemaColumnConfigContext();
  const messages = ctx?.messages ?? DEFAULT_CUSTOM_COLUMN_MESSAGES;
  const cache = ctx?.readCacheConfig();
  const configList = cache?.columnConfig ?? [];
  const currentConfigLabel = cache?.activeColumnConfigLabel ?? '';

  const chooseColumnConfig = (config: ColumnConfig) => {
    onConfirm?.(config);
    onClosed?.();
  };

  const removeConfig = (label: string) => {
    onRemove?.(label);
    onClosed?.();
  };

  return (
    <div className="do-read-column-config">
      {configList.map((item) => (
        <div
          key={item.label}
          className="read-from-local-line"
        >
          <Button
            className={['read-from-local-config', item.label === currentConfigLabel ? 'active' : '']
              .filter(Boolean)
              .join(' ')}
            size="small"
            onClick={() => chooseColumnConfig(item)}
          >
            {item.label}
          </Button>
          {!disabledDelete && ctx && !ctx.existAlreadyWithSystem(item.label) ? (
            <CloseOutlined
              className="read-from-local-delete"
              onClick={() => removeConfig(item.label)}
            />
          ) : null}
        </div>
      ))}

      {!disabledCancelButton ? (
        <div className="read-from-local-line">
          <Button
            className="read-from-local-config active"
            size="small"
            onClick={() => onClosed?.()}
          >
            {messages.cancel}
          </Button>
        </div>
      ) : null}

      {showCustomConfigButton ? (
        <div className="read-from-local-line">
          <Button
            className="read-from-local-config custom"
            size="small"
            onClick={() =>
              onCustom?.(configList.find((config) => config.label === currentConfigLabel))
            }
          >
            {messages.customConfig}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
