import { describe, expect, it } from 'vitest';

import { mapKeyToValue } from './object';

describe('object format helpers', () => {
  it('mapKeyToValue', () => {
    expect(mapKeyToValue('success', { success: 'Success' })).toBe('Success');
    expect(mapKeyToValue(1, { 1: 'Enabled' })).toBe('Enabled');
    expect(mapKeyToValue('missing', { success: 'Success' })).toBe('missing');
    expect(mapKeyToValue('missing', { success: 'Success' }, '-')).toBe('-');
  });
});
