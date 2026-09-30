import { LoadingOutlined } from '@ant-design/icons';
import { Button, Input, Popover, Space } from 'antd';
import { useState, type ReactNode } from 'react';

export type DoTxtSetterProps = {
  initValue?: string;
  inline?: boolean;
  disabled?: boolean;
  changing?: boolean;
  children?: ReactNode;
  onOk?: (value: string) => void | Promise<void>;
};

/** 行内文本编辑器，对齐 kv3 `DoTxtSetter.vue`。 */
export function DoTxtSetter({
  initValue = '',
  inline = false,
  disabled = false,
  changing = false,
  children,
  onOk,
}: DoTxtSetterProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(initValue);

  if (disabled) {
    return (
      <div className={['do-txt-setter', inline ? 'inline' : ''].filter(Boolean).join(' ')}>
        {children}
      </div>
    );
  }

  return (
    <div className={['do-txt-setter', inline ? 'inline' : ''].filter(Boolean).join(' ')}>
      <Popover
        open={open}
        trigger="click"
        placement="bottomLeft"
        onOpenChange={(v) => {
          setOpen(v);
          if (v) setDraft(initValue);
        }}
        content={
          <div className="do-txtsetter-popover">
            <Input
              allowClear
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onPressEnter={async () => {
                await onOk?.(draft);
                setOpen(false);
              }}
            />
            <div className="do-txtsetter-footer">
              <Space>
                <Button
                  size="small"
                  onClick={() => setOpen(false)}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  size="small"
                  onClick={async () => {
                    await onOk?.(draft);
                    setOpen(false);
                  }}
                >
                  确定
                </Button>
              </Space>
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
