import { Popover, Select, Tag } from 'antd';
import { useMemo, useState } from 'react';

import DialogSelectSchoolResource from './DialogSelectSchoolResource';
import { toSchoolPick, type SchoolSelectorChange, type SchoolSelectorValue } from './types';

export type SchoolSelectorProps = {
  value?: SchoolSelectorChange | null;
  multiple?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  lockEnabledStatus?: boolean;
  placeholder?: string;
  /** 选择器抽屉内默认分页大小（缺省：多选 5 / 单选 10） */
  defaultPageSize?: number;
  style?: React.CSSProperties;
  onChange?: (value: SchoolSelectorChange | null) => void;
};

/** 学校选择器：点击打开抽屉选择；多选折叠为 1 个 tag，悬浮展开全部，对齐 kv3 `SchoolSelector.vue` */
export default function SchoolSelector({
  value,
  multiple = false,
  clearable = true,
  disabled = false,
  lockEnabledStatus = true,
  placeholder = '请选择学校',
  defaultPageSize,
  style,
  onChange,
}: SchoolSelectorProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const selected = useMemo<SchoolSelectorValue[]>(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  function removeById(id: string) {
    onChange?.(selected.filter((item) => item.id !== id));
  }

  const select = (
    <Select
      className="school-selector-trigger"
      mode={multiple ? 'multiple' : undefined}
      allowClear={clearable}
      disabled={disabled}
      placeholder={placeholder}
      style={{ width: '100%', minWidth: 200 }}
      open={false}
      maxTagCount={multiple ? 1 : undefined}
      maxTagPlaceholder={(omitted) => `+ ${omitted.length}`}
      value={multiple ? selected.map((item) => item.id) : selected[0]?.id}
      options={selected.map((item) => ({ value: item.id, label: item.label }))}
      onOpenChange={(visible) => {
        if (visible && !disabled) setPickerOpen(true);
      }}
      onChange={(next: string | string[] | undefined) => {
        if (multiple) {
          const ids = Array.isArray(next) ? next : [];
          onChange?.(selected.filter((item) => ids.includes(item.id)));
          return;
        }
        if (next == null) onChange?.(null);
      }}
    />
  );

  return (
    <div
      className={['school-selector', multiple ? 'is-multiple' : ''].filter(Boolean).join(' ')}
      style={style}
    >
      {multiple && !disabled && selected.length ? (
        <Popover
          placement="topLeft"
          arrow={false}
          mouseEnterDelay={0.3}
          mouseLeaveDelay={0.14}
          classNames={{ root: 'do-selector-tags-popover' }}
          content={
            <div className="do-selector-tags-panel">
              {selected.map((item) => (
                <Tag
                  key={item.id}
                  className="do-selector-tag"
                  closable
                  onClose={(e) => {
                    e.preventDefault();
                    removeById(item.id);
                  }}
                >
                  {item.label}
                </Tag>
              ))}
            </div>
          }
        >
          {select}
        </Popover>
      ) : (
        select
      )}

      <DialogSelectSchoolResource
        open={pickerOpen}
        isMultiple={multiple}
        lockEnabledStatus={lockEnabledStatus}
        checkedRows={selected.map((item) => item.item)}
        defaultPageSize={defaultPageSize}
        onCancel={() => setPickerOpen(false)}
        onConfirm={(rows) => {
          if (multiple) {
            const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
            onChange?.(list.map(toSchoolPick));
          } else {
            const row = Array.isArray(rows) ? rows[0] : rows;
            onChange?.(row ? toSchoolPick(row) : null);
          }
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
