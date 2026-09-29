import { Button, Drawer, Space } from 'antd';
import { useRef } from 'react';

import SchoolResourceList from './SchoolResourceList';

import type { SchoolResourceRow } from '@/modules/_example/schoolResource/_api';

export default function DialogSelectSchoolResourceInner({
  open,
  isMultiple = false,
  lockEnabledStatus = false,
  checkedIds = [],
  onCancel,
  onConfirm,
}: {
  open: boolean;
  isMultiple?: boolean;
  lockEnabledStatus?: boolean;
  checkedIds?: string[];
  onCancel: () => void;
  onConfirm: (value: SchoolResourceRow | SchoolResourceRow[] | undefined) => void;
}) {
  const pending = useRef<SchoolResourceRow | SchoolResourceRow[] | undefined>(undefined);

  return (
    <Drawer
      title={isMultiple ? '选择学校（多选）' : '选择学校'}
      open={open}
      onClose={onCancel}
      width={960}
      destroyOnClose
      className="drawer-model-selector"
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={onCancel}>取消</Button>
          <Button
            type="primary"
            onClick={() => onConfirm(pending.current)}
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
          lockEnabledStatus={!!lockEnabledStatus}
          onChange={(row) => {
            pending.current = row;
          }}
        />
      </div>
    </Drawer>
  );
}
