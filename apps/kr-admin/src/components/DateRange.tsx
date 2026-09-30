import { DatePicker } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

export type DateRangeValue = [string, string] | [];

export type DateRangeProps = {
  value?: DateRangeValue | null;
  type?: 'daterange' | 'datetimerange';
  clearable?: boolean;
  style?: React.CSSProperties;
  onChange?: (value: DateRangeValue) => void;
};

const { RangePicker } = DatePicker;

/** 日期/时间范围，对齐 kv3 `DateRange.vue`（antd RangePicker）。 */
export function DateRange({
  value,
  type = 'daterange',
  clearable = true,
  style,
  onChange,
}: DateRangeProps) {
  const isDateTime = type === 'datetimerange';
  const format = isDateTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
  const parsed: [Dayjs, Dayjs] | null =
    value && value.length === 2 && value[0] && value[1]
      ? [dayjs(value[0]), dayjs(value[1])]
      : null;

  return (
    <RangePicker
      allowClear={clearable}
      showTime={isDateTime}
      format={format}
      style={{ width: 260, ...style }}
      value={parsed}
      placeholder={['开始日期', '结束日期']}
      onChange={(_dates, dateStrings) => {
        if (!dateStrings?.[0] || !dateStrings?.[1]) {
          onChange?.([]);
          return;
        }
        onChange?.([dateStrings[0], dateStrings[1]]);
      }}
    />
  );
}

export default DateRange;
