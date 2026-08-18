export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const pad = (n: number): string => String(n).padStart(2, '0');

function parseDate(input: Date | string | number | null | undefined): Date | null {
  if (input === null || input === undefined || input === '') return null;

  if (typeof input === 'number') {
    const len = input.toString().length;
    if (len === 10) return new Date(input * 1000);
    if (len === 13) return new Date(input);
    return new Date(input);
  }

  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatByPattern(date: Date, format: string): string {
  const Y = date.getFullYear();
  const M = pad(date.getMonth() + 1);
  const D = pad(date.getDate());
  const H = pad(date.getHours());
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());

  return format
    .replace('YYYY', String(Y))
    .replace('MM', M)
    .replace('DD', D)
    .replace('HH', H)
    .replace('mm', m)
    .replace('ss', s);
}

/**
 * 日期格式化（健壮版）
 * - 支持 10/13 位时间戳自动识别
 * - 无效输入返回空串
 * - 默认 'YYYY-MM-DD HH:mm:ss'
 */
export function formatDate(
  input: Date | string | number | null | undefined,
  format = DATE_TIME_FORMAT,
): string {
  const date = parseDate(input);
  if (!date) return '';
  try {
    return formatByPattern(date, format);
  } catch {
    return '';
  }
}

/**
 * 日期/日期时间快捷格式化
 * - format 为 'date' 输出 YYYY-MM-DD
 * - format 为 'dateTime' 输出 YYYY-MM-DD HH:mm:ss
 * - 支持 8 位数字（如 20240115）的容错解析
 */
export function doDate(
  input: number | string | Date,
  format: 'date' | 'dateTime' = 'date',
): string {
  const dateObj = new Date(input);

  if (Number.isNaN(dateObj.getTime())) {
    if (/^\d{8}$/.test(`${input}`)) {
      const newStr = `${input}`.split('').reduce((acc, ch, idx) => {
        const fix = [3, 5].includes(idx) ? '-' : '';
        return acc + ch + fix;
      }, '');
      return doDate(newStr, format);
    }
    return '';
  }

  return format === 'dateTime'
    ? formatByPattern(dateObj, DATE_TIME_FORMAT)
    : formatByPattern(dateObj, DATE_FORMAT);
}

export interface FormatPlainDateOptions {
  separator?: string;
  includeTime?: boolean | 'auto';
  fallback?: string;
}

/**
 * 格式化无分隔符日期字符串。
 * - 202401 -> 2024-01
 * - 20240115 -> 2024-01-15
 * - 2024011512 -> 2024-01-15 12:00:00
 */
export function formatPlainDate(
  input: string | number | null | undefined,
  options: FormatPlainDateOptions = {},
): string {
  if (input === null || input === undefined || input === '') return options.fallback ?? '';

  const { separator = '-', includeTime = 'auto', fallback } = options;
  const value = String(input).trim();
  const matched = value.match(/^(\d{4})(\d{2})(?:(\d{2})(?:(\d{2}))?)?$/);

  if (!matched) return fallback ?? value;

  const [, year, month, day, hour] = matched;
  const datePart = [year, month, day].filter(Boolean).join(separator);

  if (!hour || includeTime === false) return datePart;
  if (includeTime === true || includeTime === 'auto') return `${datePart} ${hour}:00:00`;

  return datePart;
}

function getISOWeekNumber(dateObj: Date): number {
  const date = new Date(dateObj.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
  );
}

/**
 * 日期转 ISO 周字符串，格式为 YYYYWW。
 */
export function dateToWeek(input: Date | string | number): string {
  const date = parseDate(input);
  if (!date) return '';
  return `${date.getFullYear()}${String(getISOWeekNumber(date)).padStart(2, '0')}`;
}

export interface WeekToDateRangeOptions {
  format?: string;
}

/**
 * ISO 周字符串转日期范围，输入格式为 YYYYWW。
 */
export function weekToDateRange(
  weekValue: string | number,
  options: WeekToDateRangeOptions = {},
): [string, string] {
  const value = String(weekValue);
  if (!/^\d{6}$/.test(value)) return ['', ''];

  const { format = DATE_FORMAT } = options;
  const year = Number(value.slice(0, 4));
  const week = Number(value.slice(4));
  const firstThursday = new Date(year, 0, 1);

  while (firstThursday.getDay() !== 4) {
    firstThursday.setDate(firstThursday.getDate() + 1);
  }

  const weekMonday = new Date(firstThursday);
  weekMonday.setDate(weekMonday.getDate() - 3 + (week - 1) * 7);

  const weekSunday = new Date(weekMonday);
  weekSunday.setDate(weekSunday.getDate() + 6);

  return [formatByPattern(weekMonday, format), formatByPattern(weekSunday, format)];
}

export interface FormatWeekLabelOptions {
  prefix?: string;
  suffix?: string;
}

export type DateTextLocale = 'en' | 'zh';

export interface RelativeTimeMessages {
  justNow: string;
  minuteAgo: (value: number) => string;
  hourAgo: (value: number) => string;
  dayAgo: (value: number) => string;
  weekAgo: (value: number) => string;
}

export interface DurationUnitMessages {
  day: string;
  hour: string;
  minute: string;
  second: string;
  zero: string;
}

export interface DateTextMessages {
  relativeTime: RelativeTimeMessages;
  duration: DurationUnitMessages;
}

export interface DateTextOptions {
  locale?: DateTextLocale;
  messages?: Partial<{
    relativeTime: Partial<RelativeTimeMessages>;
    duration: Partial<DurationUnitMessages>;
  }>;
}

const DATE_TEXT_MESSAGES: Record<DateTextLocale, DateTextMessages> = {
  en: {
    relativeTime: {
      justNow: 'just now',
      minuteAgo: (value) => `${value} minute${value === 1 ? '' : 's'} ago`,
      hourAgo: (value) => `${value} hour${value === 1 ? '' : 's'} ago`,
      dayAgo: (value) => `${value} day${value === 1 ? '' : 's'} ago`,
      weekAgo: (value) => `${value} week${value === 1 ? '' : 's'} ago`,
    },
    duration: {
      day: 'd',
      hour: 'h',
      minute: 'm',
      second: 's',
      zero: '0s',
    },
  },
  zh: {
    relativeTime: {
      justNow: '刚刚',
      minuteAgo: (value) => `${value}分钟前`,
      hourAgo: (value) => `${value}小时前`,
      dayAgo: (value) => `${value}天前`,
      weekAgo: (value) => `${value}周前`,
    },
    duration: {
      day: '天',
      hour: '小时',
      minute: '分钟',
      second: '秒',
      zero: '0秒',
    },
  },
};

function resolveDateTextMessages(options: DateTextOptions = {}): DateTextMessages {
  const base = DATE_TEXT_MESSAGES[options.locale || 'zh'];
  return {
    relativeTime: {
      ...base.relativeTime,
      ...options.messages?.relativeTime,
    },
    duration: {
      ...base.duration,
      ...options.messages?.duration,
    },
  };
}

export function formatWeekLabel(
  weekValue: string | number | null | undefined,
  options: FormatWeekLabelOptions = {},
): string {
  if (weekValue === null || weekValue === undefined || weekValue === '') return '';

  const value = String(weekValue);
  if (!/^\d{6}$/.test(value)) return value;

  const { prefix = '第', suffix = '周' } = options;
  return `${value.slice(0, 4)}${prefix}${Number(value.slice(4))}${suffix}`;
}

export function isToday(date: Date | string | number): boolean {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export function isSameDay(date1: Date | string | number, date2: Date | string | number): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * 起止日期之间的每日 Date 数组（包含 start 与 end）
 */
export function getDateRange(start: Date | string | number, end: Date | string | number): Date[] {
  const dates: Date[] = [];
  const startDate = new Date(start);
  const endDate = new Date(end);

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  while (startDate <= endDate) {
    dates.push(new Date(startDate));
    startDate.setDate(startDate.getDate() + 1);
  }

  return dates;
}

/**
 * 英文相对时间（轻量版）。
 * - <= 0 min → 'Just now'
 * - < 60 min → 'N mins'
 * - 其它 → HH:mm:ss
 *
 * 与 `getRelativeTime` 的中文档位互补，常用于资讯/帖子时间戳显示。
 */
export function formatTime(input: Date | string | number | null | undefined): string {
  const date = parseDate(input);
  if (!date) return '';

  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);

  if (diffMinutes <= 0) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} mins`;
  return formatByPattern(date, 'HH:mm:ss');
}

/**
 * 相对时间（含 week 档位），月以上回退到 doDate；默认中文，可传 locale/messages 覆盖。
 */
export function getRelativeTime(
  timestamp: number | string | Date,
  options: DateTextOptions = {},
): string {
  const date = parseDate(timestamp);
  if (!date) return '';
  const messages = resolveDateTextMessages(options).relativeTime;

  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;

  if (diff < minute) return messages.justNow;
  if (diff < hour) return messages.minuteAgo(Math.floor(diff / minute));
  if (diff < day) return messages.hourAgo(Math.floor(diff / hour));
  if (diff < week) return messages.dayAgo(Math.floor(diff / day));
  if (diff < month) return messages.weekAgo(Math.floor(diff / week));
  return doDate(date);
}

/**
 * @deprecated 推荐使用 getRelativeTime
 */
export function timeAgo(date: Date | string | number, options: DateTextOptions = {}): string {
  return getRelativeTime(date, options);
}

/**
 * 将毫秒数格式化为可读的时间段字符串
 */
export function formatDuration(
  ms: number,
  options: {
    maxUnit?: 'day' | 'hour' | 'minute' | 'second';
    separator?: string;
  } & DateTextOptions = {},
): string {
  const { maxUnit = 'day', separator = '' } = options;
  if (ms < 0) ms = 0;
  const messages = resolveDateTextMessages(options).duration;

  const units: { key: string; label: string; divisor: number }[] = [
    { key: 'day', label: messages.day, divisor: 86400000 },
    { key: 'hour', label: messages.hour, divisor: 3600000 },
    { key: 'minute', label: messages.minute, divisor: 60000 },
    { key: 'second', label: messages.second, divisor: 1000 },
  ];

  const startIdx = units.findIndex((u) => u.key === maxUnit);
  const parts: string[] = [];
  let remaining = ms;

  for (let i = startIdx; i < units.length; i++) {
    const { label, divisor } = units[i];
    const value = Math.floor(remaining / divisor);
    remaining %= divisor;
    if (value > 0) {
      parts.push(`${value}${label}`);
    }
  }

  return parts.length > 0 ? parts.join(separator) : messages.zero;
}

export interface FormatSecondsSign {
  h?: string;
  min?: string;
  s?: string;
}

/**
 * 秒数 → HH:MM:SS 字符串
 */
export function formatSeconds(
  seconds: number | string,
  showH = true,
  sign: FormatSecondsSign = { h: ':', min: ':', s: '' },
): string {
  if (Number.isNaN(+seconds) || (seconds !== 0 && !seconds)) return String(seconds);

  const padFn = (n: number): string => (sign.h === ':' ? String(n).padStart(2, '0') : String(n));

  let sec = Math.floor(+seconds);
  let min = 0;
  let h = 0;

  if (sec >= 60) {
    min = Math.floor(sec / 60);
    sec = sec % 60;
    if (min >= 60) {
      h = Math.floor(min / 60);
      min = min % 60;
    }
  }

  if (!showH) return `${padFn(min)}:${padFn(sec)}`;

  const hStr = h > 0 ? `${padFn(h)}${sign.h || ''}` : '';
  const mStr = min > 0 || h > 0 ? `${padFn(min)}${sign.min || ''}` : '';
  const sStr = sec > 0 || min > 0 || h > 0 ? `${padFn(sec)}${sign.s || ''}` : '';

  return `${hStr}${mStr}${sStr}`;
}

export function formatMilliseconds(
  milliseconds: number | string,
  showH = true,
  sign: FormatSecondsSign = { h: ':', min: ':', s: '' },
): string {
  if (Number.isNaN(+milliseconds) || (milliseconds !== 0 && !milliseconds)) {
    return String(milliseconds);
  }
  return formatSeconds(+milliseconds / 1000, showH, sign);
}

export function formatMicroseconds(
  microseconds: number | string,
  showH = true,
  sign: FormatSecondsSign = { h: ':', min: ':', s: '' },
): string {
  if (Number.isNaN(+microseconds) || (microseconds !== 0 && !microseconds)) {
    return String(microseconds);
  }
  return formatSeconds(+microseconds / 1_000_000, showH, sign);
}
