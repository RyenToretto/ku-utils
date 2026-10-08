import { CheckOutlined } from '@ant-design/icons';

import { THEME_OPTIONS, type ThemeMode } from '@/utils/theme';

const DEFAULT_LABELS: Record<ThemeMode, string> = {
  light: '浅色',
  dark: '深色',
  system: '跟随系统',
};

export type AppearancePickerProps = {
  value: ThemeMode;
  onChange: (mode: ThemeMode) => void;
  labelOverrides?: Partial<Record<ThemeMode, string>>;
};

export default function AppearancePicker({
  value,
  onChange,
  labelOverrides,
}: AppearancePickerProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };

  return (
    <div className="appearance-options">
      {THEME_OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            className={`appearance-option${active ? ' is-active' : ''}`}
            onPointerDown={(e) => {
              // 账户 Popover 在 mousedown 阶段就会因「外部点击」卸掉侧栏；
              // 在 pointerdown 切肤，保证真实鼠标也能落到 onChange
              if (e.button !== 0) return;
              e.preventDefault();
              onChange(opt.value);
            }}
          >
            <span>{labels[opt.value]}</span>
            {active ? <CheckOutlined /> : null}
          </button>
        );
      })}
    </div>
  );
}
