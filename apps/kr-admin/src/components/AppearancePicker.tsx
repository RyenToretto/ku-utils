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
            onClick={() => onChange(opt.value)}
          >
            <span>{labels[opt.value]}</span>
            {active ? <CheckOutlined /> : null}
          </button>
        );
      })}
    </div>
  );
}
