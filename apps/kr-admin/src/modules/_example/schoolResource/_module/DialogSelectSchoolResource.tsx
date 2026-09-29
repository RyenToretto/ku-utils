import { Button, Drawer, Space } from 'antd';
import { useRef, useState } from 'react';

import SchoolResourceList, { type SchoolResourceListProps } from './SchoolResourceList';

import type { SchoolResourceRow } from '@/modules/_example/schoolResource/_api';

export type DialogSelectSchoolResourceProps = {
  isMultiple?: boolean;
  lockEnabledStatus?: boolean;
  onChange?: (value: SchoolResourceRow | SchoolResourceRow[] | undefined) => void;
};

export type DialogSelectSchoolResourceHandle = {
  show: (checkedIds?: string[]) => void;
};

export default function DialogSelectSchoolResource({
  isMultiple = false,
  lockEnabledStatus = false,
  onChange,
}: DialogSelectSchoolResourceProps) {
  const [open, setOpen] = useState(false);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const pending = useRef<SchoolResourceRow | SchoolResourceRow[] | undefined>(undefined);

  function show(ids: string[] = []) {
    setCheckedIds(ids);
    pending.current = undefined;
    setOpen(true);
  }

  // expose via window for selector pattern simplicity
  (DialogSelectSchoolResource as unknown as { show?: typeof show }).show = show;

  return (
    <Drawer
      title={isMultiple ? '选择学校（多选）' : '选择学校'}
      open={open}
      onClose={() => setOpen(false)}
      width={960}
      destroyOnClose
      className="drawer-model-selector"
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button
            type="primary"
            onClick={() => {
              onChange?.(pending.current);
              setOpen(false);
            }}
          >
            确定
          </Button>
        </Space>
      }
    >
      <div className="do-drawer__view">
        <SchoolResourceList
          enableSelector
          inDialog
          isMultiple={isMultiple}
          checkedIds={checkedIds}
          lockEnabledStatus={lockEnabledStatus}
          onChange={(row) => {
            pending.current = row;
          }}
        />
      </div>
    </Drawer>
  );
}

export function useDialogSelectSchoolResource() {
  const [open, setOpen] = useState(false);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [pending, setPending] = useState<SchoolResourceRow | SchoolResourceRow[] | undefined>();
  const [props, setProps] = useState<
    Pick<SchoolResourceListProps, 'isMultiple' | 'lockEnabledStatus'>
  >({});

  return {
    open,
    checkedIds,
    pending,
    props,
    show(ids: string[] = [], nextProps: typeof props = {}) {
      setCheckedIds(ids);
      setPending(undefined);
      setProps(nextProps);
      setOpen(true);
    },
    setOpen,
    setPending,
  };
}
