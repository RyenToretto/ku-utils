import { LoadingOutlined } from '@ant-design/icons';
import { Popconfirm, Switch } from 'antd';

export type CellStateProps = {
  modelValue: string | number | boolean | null | undefined;
  activeValue?: string | number | boolean;
  inactiveValue?: string | number | boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  activeType?: 'success' | 'warning' | 'danger' | 'info' | 'primary';
  inactiveType?: 'success' | 'warning' | 'danger' | 'info' | 'primary';
  switchable?: boolean;
  switching?: boolean;
  activeTips?: string;
  inactiveTips?: string;
  /** true 时不经确认直接切换（与 kv3 CellState.manual 对齐） */
  manual?: boolean;
  onSwitch?: (next: string | number | boolean) => void;
};

/**
 * 状态单元格：可切换时为 Switch+确认；只读时为圆点+文案指示器。
 * 行为对齐 kv3 `CellState.vue`。
 */
export function CellState({
  modelValue,
  activeValue = 1,
  inactiveValue = 0,
  activeLabel = '启用',
  inactiveLabel = '禁用',
  activeType = 'success',
  inactiveType = 'info',
  switchable = false,
  switching = false,
  activeTips = '确认启用？',
  inactiveTips = '确认禁用？',
  manual = false,
  onSwitch,
}: CellStateProps) {
  const isActive = modelValue === activeValue;
  const targetValue = isActive ? inactiveValue : activeValue;
  const confirmTitle = isActive ? inactiveTips : activeTips;

  const emitSwitch = () => {
    onSwitch?.(targetValue);
  };

  if (switchable) {
    const sw = (
      <Switch
        checked={isActive}
        disabled={switching}
        onChange={() => {
          if (manual) emitSwitch();
        }}
      />
    );

    return (
      <div className="cell-state">
        {manual ? (
          sw
        ) : (
          <Popconfirm
            title={confirmTitle}
            okText="确定"
            cancelText="取消"
            onConfirm={emitSwitch}
          >
            {/* antd Switch 需包一层可聚焦节点供 Popconfirm 触发 */}
            <span className="cell-state-switch-wrap">{sw}</span>
          </Popconfirm>
        )}
        {switching ? (
          <LoadingOutlined
            className="cell-state-loading"
            spin
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="cell-state">
      <span className={`cell-state-indicator is-${isActive ? activeType : inactiveType}`}>
        {isActive ? activeLabel : inactiveLabel}
      </span>
    </div>
  );
}

export default CellState;
