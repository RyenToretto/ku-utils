import { describe, expect, it } from 'vitest';

import {
  calculator,
  clamp,
  formatAmountByUnit,
  formatCompactNumber,
  formatCurrency,
  formatFloat,
  formatInteger,
  formatMoney,
  formatPercent,
  formatPercentValue,
  formatThousands,
  formatUnitNumber,
  multiplyNumber,
} from './number';

describe('number', () => {
  it('clamp', () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(-5, 0, 100)).toBe(0);
  });

  it('formatThousands - 数字保留原始小数', () => {
    expect(formatThousands(1234.5)).toBe('1,234.5');
    expect(formatThousands(1234567.89)).toBe('1,234,567.89');
    expect(formatThousands(1000)).toBe('1,000');
    expect(formatThousands(-12345)).toBe('-12,345');
  });

  it('formatThousands - 字符串输入', () => {
    expect(formatThousands('1234567.89')).toBe('1,234,567.89');
    expect(formatThousands('1234')).toBe('1,234');
  });

  it('formatThousands - 非法格式返回空字符串', () => {
    expect(formatThousands('abc')).toBe('');
    expect(formatThousands(NaN)).toBe('');
    expect(formatThousands('')).toBe('');
  });

  it('formatCurrency', () => {
    expect(formatCurrency(1234.5)).toBe('¥1,234.50');
    expect(formatCurrency(1000, '$', 0)).toBe('$1,000');
  });

  it('formatPercent', () => {
    expect(formatPercent(0.123)).toBe('12.30%');
  });

  it('formatMoney / integer / float', () => {
    expect(formatMoney(1234.5)).toBe('1234.50');
    expect(formatMoney(1234.5, { decimals: 1, separator: true })).toBe('1,234.5');
    expect(formatMoney('abc')).toBe('abc');
    expect(formatInteger(1234.5)).toBe('1,235');
    expect(formatFloat(1234.5, 3)).toBe('1,234.500');
  });

  it('formatAmountByUnit', () => {
    expect(formatAmountByUnit(12345, { unitValue: 100, decimals: 2 })).toBe('123.45');
    expect(formatAmountByUnit(945128, { unitValue: 10000, suffix: '万' })).toBe('94.51万');
    expect(formatAmountByUnit('abc', { fallback: '-' })).toBe('-');
  });

  it('formatPercentValue', () => {
    expect(formatPercentValue(0.1234)).toBe('12.34');
    expect(formatPercentValue(0.1234, { decimals: 1, showSign: true })).toBe('12.3%');
    expect(formatPercentValue(0.123456789, { decimals: 'auto' })).toBe('12.345679');
    expect(formatPercentValue('', { fallback: '-' })).toBe('-');
  });

  it('multiplyNumber', () => {
    expect(multiplyNumber(12.345, { factor: 100, decimals: 1, separator: true })).toBe('1,234.5');
    expect(multiplyNumber('abc')).toBe('abc');
  });

  it('formatUnitNumber', () => {
    expect(formatUnitNumber(1234)).toBe('1K+');
    expect(formatUnitNumber(1_200_000, { showPlus: false, decimals: 1 })).toBe('1.2M');
    expect(formatUnitNumber(-2_500_000_000, { showPlus: false, decimals: 2 })).toBe('-2.50B');
    expect(formatUnitNumber('abc', { fallback: '-' })).toBe('-');
  });

  it('formatCompactNumber', () => {
    expect(formatCompactNumber(10_000)).toBe('10000');
    expect(formatCompactNumber(252_000)).toBe('0.25M');
    expect(formatCompactNumber(1_200_000)).toBe('1.20M');
    expect(formatCompactNumber(-95_000)).toBe('-0.10M');
    expect(formatCompactNumber(252_000, { unit: '百万' })).toBe('0.25百万');
    expect(formatCompactNumber(12_345, { unitValue: 10_000, unit: '万', decimals: 1 })).toBe(
      '1.2万',
    );
    expect(formatCompactNumber('')).toBe('');
    expect(formatCompactNumber('abc', { fallback: '-' })).toBe('-');
  });

  it('calculator 浮点精度', () => {
    expect(calculator.fAdd(0.1, 0.2)).toBe(0.3);
    expect(calculator.fSub(1, 0.9)).toBe(0.1);
    expect(calculator.fMul(0.1, 0.2)).toBe(0.02);
    expect(calculator.fDiv(0.3, 0.1)).toBe(3);
  });
});
