import { LoadingOutlined } from '@ant-design/icons';
import { Button, Input, Popover, type InputRef } from 'antd';
import { useRef, useState, type ReactNode } from 'react';

export type DoTxtSetterProps = {
  initValue?: string;
  required?: boolean;
  placeholder?: string;
  inline?: boolean;
  disabled?: boolean;
  changing?: boolean;
  children?: ReactNode;
  onOk?: (value: string) => void | Promise<void>;
};

/** 行内文本编辑器，对齐 kv3 `DoTxtSetter.vue`。 */
export function DoTxtSetter({
  initValue = '',
  required = true,
  placeholder = '请输入',
  inline = false,
  disabled = false,
  changing = false,
  children,
  onOk,
}: DoTxtSetterProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(initValue);
  const [error, setError] = useState('');
  const inputRef = useRef<InputRef>(null);
  const rootClass = ['do-txt-setter', inline ? 'inline' : ''].filter(Boolean).join(' ');

  if (disabled) {
    return <div className={rootClass}>{children}</div>;
  }

  const confirm = () => {
    if (required && !draft) {
      setError(placeholder);
      return;
    }
    if (changing) return;
    setOpen(false);
    if (draft !== initValue) void onOk?.(draft);
  };

  return (
    <div className={rootClass}>
      <Popover
        open={open}
        trigger="click"
        placement="bottomLeft"
        onOpenChange={(v) => {
          if (v && changing) return;
          setOpen(v);
          if (v) {
            setDraft(initValue);
            setError('');
          }
        }}
        afterOpenChange={(v) => {
          if (v) inputRef.current?.focus();
        }}
        content={
          <div className="do-txtsetter-popover">
            <Input
              ref={inputRef}
              allowClear
              value={draft}
              placeholder={placeholder}
              status={error ? 'error' : undefined}
              onChange={(e) => {
                setDraft(e.target.value);
                if (e.target.value) setError('');
              }}
              onPressEnter={confirm}
            />
            {error ? <div className="do-txtsetter-error">{error}</div> : null}
            <div className="do-txtsetter-footer">
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
        <div className={['txt-set-btn', changing ? 'changing' : ''].filter(Boolean).join(' ')}>
          {changing ? <LoadingOutlined spin /> : children}
        </div>
      </Popover>
    </div>
  );
}

export default DoTxtSetter;
