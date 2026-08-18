import { isValidNumber } from './is';

/**
 * 把比例字符串/数字解析成 number ratio。
 * - 已是合法数字 → 原样返回
 * - 形如 'W:H'（如 '16:9'） → 返回 W/H
 * - 解析失败 → 返回兜底值 0.75
 */
export function getStrRatio(value: unknown): number {
  if (isValidNumber(value)) return Number(value);
  try {
    const str = typeof value === 'string' ? value : '';
    const [wStr, hStr] = str.split(':');
    const w = Number(wStr);
    const h = Number(hStr);
    const ratio = isValidNumber(w) && isValidNumber(h) && h !== 0 ? w / h : NaN;
    return isValidNumber(ratio) ? ratio : 0.75;
  } catch {
    return 0.75;
  }
}

export function formatThousands(num: string | number = ''): string {
  if (!/^(-)?(\d+)(\.\d+)?$/.test(String(num))) return '';

  const parts = String(num).split('.');
  const sign = Number(num) >= 0 ? '' : '-';
  const integer = String(Math.abs(Number(parts[0])));
  const decimal = parts[1] || '';

  const chunks: string[] = [];
  for (let s = integer.length; s >= 0; s -= 3) {
    const start = Math.max(s - 3, 0);
    if (s > start) chunks.unshift(integer.slice(start, s));
  }

  return `${sign}${chunks.join(',')}${decimal ? `.${decimal}` : ''}`;
}

export function formatCurrency(amount: number, currency = '¥', decimals = 2): string {
  if (Number.isNaN(amount)) return `${currency}0.00`;
  return `${currency}${formatThousands(amount.toFixed(decimals))}`;
}

export function formatPercent(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

type NumericInput = string | number | null | undefined;

function parseFiniteNumber(value: NumericInput): number | null {
  if (value === null || value === undefined || value === '') return null;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function normalizeDecimals(decimals: number): number {
  return Math.max(0, Math.trunc(decimals));
}

export interface FormatMoneyOptions {
  decimals?: number;
  separator?: boolean;
  fallback?: string;
}

/**
 * 数字金额格式化：保留小数，可选千分位，不附加货币符号。
 */
export function formatMoney(value: NumericInput, options: FormatMoneyOptions = {}): string {
  const { decimals = 2, separator = false, fallback } = options;
  const numericValue = parseFiniteNumber(value);

  if (numericValue === null) return fallback ?? String(value ?? '');

  const formatted = numericValue.toFixed(normalizeDecimals(decimals));
  return separator ? formatThousands(formatted) : formatted;
}

export function formatInteger(value: NumericInput, separator = true): string {
  return formatMoney(value, { decimals: 0, separator });
}

export function formatFloat(value: NumericInput, decimals = 2, separator = true): string {
  return formatMoney(value, { decimals, separator });
}

export interface FormatAmountByUnitOptions extends FormatMoneyOptions {
  unitValue?: number;
  suffix?: string;
}

/**
 * 按单位缩放后格式化金额/数值，例如分转元、万分之一元转元、原值转万等。
 */
export function formatAmountByUnit(
  value: NumericInput,
  options: FormatAmountByUnitOptions = {},
): string {
  const { unitValue = 1, suffix = '', ...moneyOptions } = options;
  const numericValue = parseFiniteNumber(value);

  if (numericValue === null || !Number.isFinite(unitValue) || unitValue === 0) {
    return moneyOptions.fallback ?? String(value ?? '');
  }

  return `${formatMoney(numericValue / unitValue, moneyOptions)}${suffix}`;
}

export interface FormatPercentValueOptions {
  decimals?: number | 'auto';
  showSign?: boolean;
  fallback?: string;
}

/**
 * 百分比数值格式化：输入 0.123 输出 12.30，可选择附加 %。
 */
export function formatPercentValue(
  value: NumericInput,
  options: FormatPercentValueOptions = {},
): string {
  const { decimals = 2, showSign = false, fallback = '' } = options;
  const numericValue = parseFiniteNumber(value);

  if (numericValue === null) return fallback;

  const percentValue = numericValue * 100;
  const formatted =
    decimals === 'auto'
      ? String(Number(percentValue.toFixed(6)))
      : percentValue.toFixed(normalizeDecimals(decimals));

  return `${formatted}${showSign ? '%' : ''}`;
}

export interface MultiplyNumberOptions {
  factor?: number;
  decimals?: number;
  separator?: boolean;
  fallback?: string;
}

export function multiplyNumber(value: NumericInput, options: MultiplyNumberOptions = {}): string {
  const { factor = 1, decimals, separator = false, fallback } = options;
  const numericValue = parseFiniteNumber(value);

  if (numericValue === null || !Number.isFinite(factor)) return fallback ?? String(value ?? '');

  const result = numericValue * factor;
  const formatted =
    typeof decimals === 'number' ? result.toFixed(normalizeDecimals(decimals)) : String(result);

  return separator ? formatThousands(formatted) : formatted;
}

export interface FormatUnitNumberOptions {
  decimals?: number;
  showPlus?: boolean;
  maxUnit?: 'B' | 'M' | 'K' | '';
  fallback?: string;
}

/**
 * 数字转 K/M/B 单位展示，适合报表图表短文本。
 */
export function formatUnitNumber(
  value: NumericInput,
  options: FormatUnitNumberOptions = {},
): string {
  const { decimals = 0, showPlus = true, maxUnit = 'B', fallback } = options;
  const numericValue = parseFiniteNumber(value);

  if (numericValue === null) return fallback ?? String(value ?? '');

  const absValue = Math.abs(numericValue);
  let unit = '';
  let divisor = 1;

  if (absValue >= 1e9 && maxUnit === 'B') {
    unit = 'B';
    divisor = 1e9;
  } else if (absValue >= 1e6 && ['B', 'M'].includes(maxUnit)) {
    unit = 'M';
    divisor = 1e6;
  } else if (absValue >= 1e3 && ['B', 'M', 'K'].includes(maxUnit)) {
    unit = 'K';
    divisor = 1e3;
  }

  const scaledValue = numericValue / divisor;
  const formatted = showPlus
    ? String(Math.trunc(scaledValue))
    : scaledValue.toFixed(normalizeDecimals(decimals));
  const hasRemainder = numericValue % divisor !== 0;
  const plus = showPlus && hasRemainder ? '+' : '';

  return `${formatThousands(formatted)}${unit}${plus}`;
}

export interface FormatCompactNumberOptions {
  threshold?: number;
  unitValue?: number;
  unit?: string;
  decimals?: number;
  fallback?: string;
}

export function formatCompactNumber(
  value: string | number | null | undefined,
  options: FormatCompactNumberOptions = {},
): string {
  const {
    threshold = 10_000,
    unitValue = 1_000_000,
    unit = 'M',
    decimals = 2,
    fallback = '',
  } = options;

  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
    return fallback;
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return fallback;

  if (Math.abs(numericValue) <= threshold) return String(numericValue);

  return `${(numericValue / unitValue).toFixed(Math.max(0, Math.trunc(decimals)))}${unit}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const calculator = {
  fAdd(a: number, b: number): number {
    const decA = (a.toString().split('.')[1] || '').length;
    const decB = (b.toString().split('.')[1] || '').length;
    const m = Math.pow(10, Math.max(decA, decB));
    return (Math.round(a * m) + Math.round(b * m)) / m;
  },
  fSub(a: number, b: number): number {
    const decA = (a.toString().split('.')[1] || '').length;
    const decB = (b.toString().split('.')[1] || '').length;
    const m = Math.pow(10, Math.max(decA, decB));
    return (Math.round(a * m) - Math.round(b * m)) / m;
  },
  fMul(a: number, b: number): number {
    let m = 0;
    const sA = a.toString();
    const sB = b.toString();
    m += (sA.split('.')[1] || '').length;
    m += (sB.split('.')[1] || '').length;
    return (Number(sA.replace('.', '')) * Number(sB.replace('.', ''))) / Math.pow(10, m);
  },
  fDiv(a: number, b: number): number {
    const decA = (a.toString().split('.')[1] || '').length;
    const decB = (b.toString().split('.')[1] || '').length;
    const intA = Number(a.toString().replace('.', ''));
    const intB = Number(b.toString().replace('.', ''));
    return (intA / intB) * Math.pow(10, decB - decA);
  },
};
