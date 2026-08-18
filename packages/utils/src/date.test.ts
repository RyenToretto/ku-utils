import { describe, expect, it } from 'vitest';

import {
  dateToWeek,
  formatDuration,
  formatMicroseconds,
  formatMilliseconds,
  formatPlainDate,
  formatWeekLabel,
  getRelativeTime,
  weekToDateRange,
} from './date';

describe('date format helpers', () => {
  it('formatPlainDate', () => {
    expect(formatPlainDate('202401')).toBe('2024-01');
    expect(formatPlainDate('20240115')).toBe('2024-01-15');
    expect(formatPlainDate('2024011512')).toBe('2024-01-15 12:00:00');
    expect(formatPlainDate('2024011512', { includeTime: false })).toBe('2024-01-15');
    expect(formatPlainDate('20240115', { separator: '/' })).toBe('2024/01/15');
    expect(formatPlainDate('bad', { fallback: '-' })).toBe('-');
  });

  it('ISO week helpers', () => {
    expect(dateToWeek('2024-01-04')).toBe('202401');
    expect(weekToDateRange('202401')).toEqual(['2024-01-01', '2024-01-07']);
    expect(weekToDateRange('bad')).toEqual(['', '']);
    expect(formatWeekLabel('202401')).toBe('2024第1周');
    expect(formatWeekLabel('202401', { prefix: ' Week ', suffix: '' })).toBe('2024 Week 1');
    expect(formatWeekLabel('bad')).toBe('bad');
  });

  it('format milliseconds and microseconds', () => {
    expect(formatMilliseconds(61_000)).toBe('01:01');
    expect(formatMicroseconds(3_660_000_000)).toBe('01:01:00');
    expect(formatMilliseconds('bad')).toBe('bad');
  });

  it('relative time defaults to zh and supports en/messages', () => {
    const now = Date.now();

    expect(getRelativeTime(now - 30_000)).toBe('刚刚');
    expect(getRelativeTime(now - 2 * 60_000)).toBe('2分钟前');
    expect(getRelativeTime(now - 2 * 60_000, { locale: 'en' })).toBe('2 minutes ago');
    expect(
      getRelativeTime(now - 2 * 60_000, {
        messages: { relativeTime: { minuteAgo: (value) => `${value}m` } },
      }),
    ).toBe('2m');
  });

  it('formatDuration defaults to zh and supports en/messages', () => {
    expect(formatDuration(3_661_000, { maxUnit: 'hour' })).toBe('1小时1分钟1秒');
    expect(formatDuration(3_661_000, { maxUnit: 'hour', locale: 'en' })).toBe('1h1m1s');
    expect(
      formatDuration(0, {
        messages: { duration: { zero: 'none' } },
      }),
    ).toBe('none');
  });
});
