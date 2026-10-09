import { EditOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, InputNumber, Popover } from 'antd';
import { useRef, useState, type ComponentRef, type ReactNode } from 'react';

export type DoNumberSetterProps = {
  num?: number;
  newValue?: number;
  minNum?: number;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  changing?: boolean;
  children?: ReactNode;
  onOk?: (value: number) => void | Promise<void>;
};

/** 行内数字编辑器，对齐 kv3 `DoNumberSetter.vue`。 */
export function DoNumberSetter({
  num = 0,
  newValue,
  minNum = 0,
  label = '',
  placeholder,
  disabled = false,
  changing = false,
  children,
  onOk,
}: DoNumberSetterProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<number | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<ComponentRef<typeof InputNumber>>(null);
  const resolvedPlaceholder = placeholder ?? `请输入${label}`;

  if (disabled) {
    return (
      <span className="do-number-setter">
        <span className="do-number-setter-label">{children}</span>
      </span>
    );
  }

  const confirm = () => {
    if (draft === null) {
      setError(resolvedPlaceholder);
      return;
    }
    if (changing) return;
    setOpen(false);
    if (draft !== num) void onOk?.(draft);
  };

  return (
    <span className="do-number-setter">
      <span className="do-number-setter-label">{children}</span>
      <Popover
        open={open}
        trigger="click"
        placement="bottomRight"
        onOpenChange={(v) => {
          if (v && changing) return;
          setOpen(v);
          if (v) {
            setDraft(newValue ?? num);
            setError('');
          }
        }}
        afterOpenChange={(v) => {
          if (v) inputRef.current?.focus();
        }}
        content={
          <div className="do-number-setter-popover">
            {label ? <div className="do-number-setter-title">{label}</div> : null}
            <InputNumber
              ref={inputRef}
              className="do-number-setter-input"
              min={minNum}
              value={draft}
              placeholder={resolvedPlaceholder}
              status={error ? 'error' : undefined}
              onChange={(v) => {
                setDraft(v);
                if (v !== null) setError('');
              }}
              onPressEnter={confirm}
            />
            {error ? <div className="do-number-setter-error">{error}</div> : null}
            <div className="do-number-setter-footer">
              <Button
                size="small"
                onClick={() => setOpen(false)}
              >
                取消
              </Button>
              <Button
                type="primary"
                size="small"
                onClick={confirm}
              >
                确定
              </Button>
            </div>
          </div>
        }
      >
        <span
          className={[
            'do-number-setter-control',
            changing ? 'is-changing' : '',
            open ? 'is-active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {changing ? <LoadingOutlined spin /> : <EditOutlined />}
        </span>
      </Popover>
    </span>
  );
}

export default DoNumberSetter;
