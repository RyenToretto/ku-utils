import { format, isValid } from 'date-fns';

export type DateTimeInput = string | number | Date | null | undefined;

export interface DateTimeParts {
  date: string;
  time: string;
  compact: string;
}

function toDate(val: DateTimeInput): Date | null {
  if (val == null || val === '') return null;
  const d = typeof val === 'string' ? new Date(val.replace(/-/g, '/')) : new Date(val);
  if (!isValid(d)) return null;
  return d;
}

/** 解析时间为表格 Cell 双行展示片段 */
export function parseDateTimeParts(val: DateTimeInput): DateTimeParts | null {
  const d = toDate(val);
  if (!d) return null;
  return {
    date: format(d, 'yyyy-MM-dd'),
    time: format(d, 'HH:mm:ss'),
    compact: format(d, 'yyyy-MM-dd HH:mm'),
  };
}

/** 弹层 / descriptions 单行格式化（date-fns 模板：`yyyy-MM-dd HH:mm:ss`） */
export function formatDateTime(val: DateTimeInput, fmt = 'yyyy-MM-dd HH:mm:ss'): string {
  const d = toDate(val);
  if (!d) return '-';
  return format(d, fmt);
}
