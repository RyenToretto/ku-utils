import { describe, expect, it } from 'vitest';

import { normalizeSourceChannel, resolveSourceFromParams } from './sourceChannel';

describe('sourceChannel', () => {
  it('normalizes channel values to the server enum casing', () => {
    expect(normalizeSourceChannel('Facebook')).toBe('facebook');
    expect(normalizeSourceChannel('organic')).toBe('Organic');
    expect(normalizeSourceChannel('tecno')).toBe('TECNO');
  });

  it('keeps exact casing when enum values only differ by case', () => {
    expect(normalizeSourceChannel('DL')).toBe('DL');
    expect(normalizeSourceChannel('dl')).toBe('dl');
  });

  it('keeps unknown channel values unchanged', () => {
    expect(normalizeSourceChannel('customChannel')).toBe('customChannel');
  });

  it('resolves source from the default source key', () => {
    expect(resolveSourceFromParams({ source: 'Facebook' }, ['source'])).toBe('facebook');
  });

  it('resolves source from configured url keys by priority', () => {
    expect(
      resolveSourceFromParams(
        {
          channelName: 'Facebook',
          source: 'google',
        },
        ['channelName', 'source'],
      ),
    ).toBe('facebook');
  });

  it('skips empty source values and checks the next configured key', () => {
    expect(
      resolveSourceFromParams(
        {
          source: '',
          channelName: 'TikTok',
        },
        ['source', 'channelName'],
      ),
    ).toBe('tiktok');
  });

  it('returns undefined when no configured key exists', () => {
    expect(resolveSourceFromParams({ channelName: 'Facebook' }, ['source'])).toBeUndefined();
  });
});
