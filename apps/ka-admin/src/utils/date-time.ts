import { format, isValid, parseISO } from 'date-fns';

export type DateTimeInput = string | number | Date | null | undefined;

export interface DateTimeParts {
  date: string;
  time: string;
  compact: string;
}

function toDate(val: DateTimeInput): Date | null {
  if (val == null || val === '') return null;
  if (typeof val !== 'string') {
    const d = new Date(val);
    return isValid(d) ? d : null;
  }
  // parseISO 兼容 `T` / 空格分隔与时区后缀；其余写法（如 `yyyy/MM/dd`）交给 Date，横杠转斜杠兼容 Safari
  const iso = parseISO(val);
  if (isValid(iso)) return iso;
  const d = new Date(val.replace(/-/g, '/'));
  return isValid(d) ? d : null;
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
