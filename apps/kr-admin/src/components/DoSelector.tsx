import { Select, Tag } from 'antd';
import { useMemo } from 'react';

export type DoSelectorOption = {
  value: string | number;
  label: string;
};

export type DoSelectorProps = {
  value?: string | number | Array<string | number> | null;
  options?: DoSelectorOption[];
  multiple?: boolean;
  clearable?: boolean;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  onChange?: (value: string | number | Array<string | number> | null) => void;
};

/** 静态枚举 / 简单下拉（不替代分页实体选择器） */
export function DoSelector({
  value,
  options = [],
  multiple = false,
  clearable = true,
  placeholder = '请选择',
  disabled,
  style,
  onChange,
}: DoSelectorProps) {
  const mode = multiple ? 'multiple' : undefined;
  return (
    <Select
      allowClear={clearable}
      disabled={disabled}
      mode={mode}
      placeholder={placeholder}
      style={{ minWidth: 160, ...style }}
      options={options.map((o) => ({ value: o.value, label: o.label }))}
      value={value ?? undefined}
      onChange={(v) => onChange?.(v ?? null)}
    />
  );
}

export type DoWordsTagProps = {
  words?: string[];
  max?: number;
};

export function DoWordsTag({ words = [], max = 3 }: DoWordsTagProps) {
  const shown = useMemo(() => words.slice(0, max), [words, max]);
  const rest = Math.max(0, words.length - shown.length);
  if (!words.length) return <span>—</span>;
  return (
    <span className="do-words-tag">
      {shown.map((w) => (
        <Tag key={w}>{w}</Tag>
      ))}
      {rest > 0 ? <Tag>+{rest}</Tag> : null}
    </span>
  );
}

export default DoSelector;
