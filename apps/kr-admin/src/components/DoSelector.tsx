import { Select } from 'antd';
import { useEffect, useRef, useState } from 'react';

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
  const [requesting, setRequesting] = useState(false);
  /** 上次成功发起请求时的 payload 快照；payload 未变则展开不重拉 */
  const cacheKeyRef = useRef<string | null>(null);
  const mountedRef = useRef(true);
  const mode = multiple ? 'multiple' : undefined;
  const resolved = payload ? remoteOptions : options;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  function fetchOptions() {
    if (!payload) return;
    const key = JSON.stringify(payload);
    if (key === cacheKeyRef.current) return;
    cacheKeyRef.current = key;
    setRequesting(true);
    payload
      .requestFunc()
      .then((list) => {
        if (mountedRef.current) setRemoteOptions(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        cacheKeyRef.current = null;
      })
      .finally(() => {
        if (mountedRef.current) setRequesting(false);
      });
  }

  return (
    <Select
      allowClear={clearable}
      disabled={disabled}
      mode={mode}
      placeholder={placeholder}
      style={{ minWidth: 160, ...style }}
      options={requesting ? [] : resolved.map((o) => ({ value: o.value, label: o.label }))}
      notFoundContent={
        requesting ? <span className="do-selector-loading">加载中...</span> : undefined
      }
      value={value ?? undefined}
      onOpenChange={(open) => {
        if (open) fetchOptions();
      }}
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

export default DoSelector;
