import { EditOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, InputNumber, Popover, Space } from 'antd';
import { useState, type ReactNode } from 'react';

export type DoNumberSetterProps = {
  num?: number;
  newValue?: number;
  minNum?: number;
  label?: string;
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
  label = '数值',
  disabled = false,
  changing = false,
  children,
  onOk,
}: DoNumberSetterProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<number>(newValue ?? num);

  if (disabled) {
    return (
      <span className="do-number-setter">
        <span className="do-number-setter-label">{children}</span>
      </span>
    );
  }

  return (
    <span className="do-number-setter">
      <span className="do-number-setter-label">{children}</span>
      <Popover
        open={open}
        trigger="click"
        placement="rightBottom"
        onOpenChange={(v) => {
          setOpen(v);
          if (v) setDraft(newValue ?? num);
        }}
        content={
          <div className="do-number-setter-popover">
            <div className="do-number-setter-form">
              <span style={{ marginRight: 8 }}>{label}</span>
              <InputNumber
                min={minNum}
                value={draft}
                onChange={(v) => setDraft(Number(v ?? minNum))}
              />
            </div>
            <div className="do-number-setter-footer">
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
        <span className="do-number-setter-control">
          {changing ? <LoadingOutlined spin /> : <EditOutlined />}
        </span>
      </Popover>
    </span>
  );
}

export default DoNumberSetter;
