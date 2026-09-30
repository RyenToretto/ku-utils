import { Select } from 'antd';
import { useEffect, useState } from 'react';

export type DoSelectorOption = {
  value: string | number;
  label: string;
};

export type DoSelectorProps = {
  value?: string | number | Array<string | number> | null;
  options?: DoSelectorOption[];
  /** 远程拉取；与 options 二选一，优先 payload */
  payload?: {
    keyword?: string;
    requestFunc: () => Promise<DoSelectorOption[]>;
  };
  multiple?: boolean;
  clearable?: boolean;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  onChange?: (value: string | number | Array<string | number> | null) => void;
  onSelectChange?: (option: DoSelectorOption | DoSelectorOption[] | null) => void;
};

/** 静态枚举 / 简单远程下拉（不替代分页实体选择器） */
export function DoSelector({
  value,
  options = [],
  payload,
  multiple = false,
  clearable = true,
  placeholder = '请选择',
  disabled,
  style,
  onChange,
  onSelectChange,
}: DoSelectorProps) {
  const [remoteOptions, setRemoteOptions] = useState<DoSelectorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const mode = multiple ? 'multiple' : undefined;
  const resolved = payload ? remoteOptions : options;

  useEffect(() => {
    if (!payload) return;
    let cancelled = false;
    setLoading(true);
    void payload
      .requestFunc()
      .then((list) => {
        if (!cancelled) setRemoteOptions(Array.isArray(list) ? list : []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [payload]);

  return (
    <Select
      allowClear={clearable}
      disabled={disabled}
      loading={loading}
      mode={mode}
      placeholder={placeholder}
      style={{ minWidth: 160, ...style }}
      options={resolved.map((o) => ({ value: o.value, label: o.label }))}
      value={value ?? undefined}
      onChange={(v) => {
        onChange?.(v ?? null);
        if (!onSelectChange) return;
        if (v == null || v === '') {
          onSelectChange(null);
          return;
        }
        if (Array.isArray(v)) {
          onSelectChange(resolved.filter((o) => v.includes(o.value)));
        } else {
          onSelectChange(resolved.find((o) => o.value === v) ?? null);
        }
      }}
    />
  );
}

export { DoWordsTag } from './DoWordsTag';
export type { DoWordsTagProps } from './DoWordsTag';

export default DoSelector;
