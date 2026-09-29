import dayjs from 'dayjs';

export type DateTimeInput = string | number | Date | null | undefined;

export interface DateTimeParts {
  date: string;
  time: string;
  compact: string;
}

function toDayjs(val: DateTimeInput) {
  if (val == null || val === '') return null;
  const d = dayjs(val);
  if (!d.isValid()) return null;
  return d;
}

/** 解析时间为表格 Cell 双行展示片段 */
export function parseDateTimeParts(val: DateTimeInput): DateTimeParts | null {
  const d = toDayjs(val);
  if (!d) return null;
  return {
    date: d.format('YYYY-MM-DD'),
    time: d.format('HH:mm:ss'),
    compact: d.format('YYYY-MM-DD HH:mm'),
  };
}

/** 弹层 / descriptions 单行格式化 */
export function formatDateTime(val: DateTimeInput, fmt = 'YYYY-MM-DD HH:mm:ss'): string {
  if (val == null || val === '') return '-';
  const d = toDayjs(val);
  if (!d) return '-';
  return d.format(fmt);
}
