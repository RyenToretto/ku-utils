import { describe, expect, it } from 'vitest';

import { stripHtml } from './string';

describe('string format helpers', () => {
  it('stripHtml', () => {
    expect(stripHtml('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
    expect(stripHtml('<p>Hello world</p>', { maxLength: 5 })).toBe('Hello...');
    expect(stripHtml('<p>Hello world</p>', { maxLength: 5, suffix: '' })).toBe('Hello');
    expect(stripHtml(null)).toBe('');
  });
});
