import { Select, Tag } from 'antd';
import { useMemo, useState } from 'react';

import DialogSelectSchoolResourceInner from './DialogSelectSchoolResourceInner';

import type { SchoolResourceRow } from '@/modules/_example/schoolResource/_api';

export type SchoolSelectorValue =
  | { id: string; label: string; item?: SchoolResourceRow }
  | Array<{ id: string; label: string; item?: SchoolResourceRow }>
  | null;

export type SchoolSelectorProps = {
  value?: SchoolSelectorValue;
  multiple?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  lockEnabledStatus?: boolean;
  placeholder?: string;
  /** 选择器抽屉内默认分页大小（金标多选 Demo 用 5） */
  defaultPageSize?: number;
  style?: React.CSSProperties;
  onChange?: (value: SchoolSelectorValue) => void;
};

export default function SchoolSelector({
  value,
  multiple = false,
  clearable = true,
  disabled,
  lockEnabledStatus,
  placeholder = '请选择学校',
  defaultPageSize,
  style,
  onChange,
}: SchoolSelectorProps) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => {
    if (!value) return [] as Array<{ id: string; label: string }>;
    return Array.isArray(value) ? value : [value];
  }, [value]);

  return (
    <>
      <Select
        mode={multiple ? 'multiple' : undefined}
        allowClear={clearable}
        disabled={disabled}
        placeholder={placeholder}
        style={{ minWidth: 200, ...style }}
        open={false}
        value={multiple ? selected.map((s) => s.id) : selected[0]?.id}
        options={selected.map((s) => ({ value: s.id, label: s.label }))}
        tagRender={(props) => <Tag {...props}>{props.label}</Tag>}
        onClear={() => onChange?.(multiple ? [] : null)}
        onOpenChange={(visible) => {
          if (visible && !disabled) setOpen(true);
        }}
      />
      <DialogSelectSchoolResourceInner
        open={open}
        isMultiple={multiple}
        lockEnabledStatus={lockEnabledStatus}
        checkedIds={selected.map((s) => s.id)}
        defaultPageSize={defaultPageSize}
        onCancel={() => setOpen(false)}
        onConfirm={(rows) => {
          if (multiple) {
            const list = (Array.isArray(rows) ? rows : rows ? [rows] : []).map((r) => ({
              id: r.id,
              label: r.schoolName,
              item: r,
            }));
            onChange?.(list);
          } else {
            const row = Array.isArray(rows) ? rows[0] : rows;
            onChange?.(row ? { id: row.id, label: row.schoolName, item: row } : null);
          }
          setOpen(false);
        }}
      />
    </>
  );
}
