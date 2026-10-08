import { Button, Drawer } from 'antd';
import { useEffect, useState } from 'react';

import SchoolResourceList from './SchoolResourceList';

import type { SchoolResourceRow } from '@/modules/_example/schoolResource/_api';

export type DialogSelectSchoolResourceProps = {
  open: boolean;
  isMultiple?: boolean;
  lockEnabledStatus?: boolean;
  /** 打开时回显的已选行 */
  checkedRows?: SchoolResourceRow[];
  defaultPageSize?: number;
  onCancel: () => void;
  onConfirm: (value: SchoolResourceRow | SchoolResourceRow[] | undefined) => void;
};

/** 学校选择抽屉，对齐 kv3 `DialogSelectSchoolResource.vue` */
export default function DialogSelectSchoolResource({
  open,
  isMultiple = false,
  lockEnabledStatus = true,
  checkedRows = [],
  defaultPageSize,
  onCancel,
  onConfirm,
}: DialogSelectSchoolResourceProps) {
  const [picked, setPicked] = useState<SchoolResourceRow[]>([]);
  const pageSize = defaultPageSize ?? (isMultiple ? 5 : 10);

  useEffect(() => {
    if (open) setPicked(checkedRows);
    // 仅在打开瞬间快照已选，抽屉内的勾选不回写外部
  }, [open]);

  function confirm() {
    onConfirm(isMultiple ? picked : picked[0]);
  }

  return (
    <Drawer
      title="选择学校"
      open={open}
      onClose={onCancel}
      width={960}
      maskClosable={false}
      keyboard={false}
      destroyOnHidden
      className="drawer-model-selector"
      footer={
        <div className="do-drawer__foot_btn">
          {isMultiple ? <span className="selected-count">已选 {picked.length} 所</span> : null}
          <Button onClick={onCancel}>取 消</Button>
          <Button
            type="primary"
            onClick={confirm}
          >
            确 定
          </Button>
        </div>
      }
    >
      <div className="do-drawer__view">
        <SchoolResourceList
          enableSelector
          inDialog
          isMultiple={isMultiple}
          checkedRows={checkedRows}
          lockEnabledStatus={lockEnabledStatus}
          defaultPageSize={pageSize}
          onChange={(value) => {
            const list = Array.isArray(value) ? value : value ? [value] : [];
            setPicked(isMultiple ? list : list.slice(0, 1));
          }}
        />
      </div>
    </Drawer>
  );
}
