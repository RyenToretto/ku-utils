import { describe, expect, it } from 'vitest';

import { encodeShiftHex } from './encoding';

describe('encodeShiftHex', () => {
  it('shifts each char by 2 and writes lowercase hex pairs', () => {
    expect(encodeShiftHex('a')).toBe('63');
    expect(encodeShiftHex('ab')).toBe('6364');
  });

  it('supports custom shift amount', () => {
    expect(encodeShiftHex('a', 1)).toBe('62');
  });
});
