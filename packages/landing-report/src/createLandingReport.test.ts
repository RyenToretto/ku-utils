import type { ReportRequestFn } from '@ku-utils/report';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function createMemoryStorage(): Storage {
  const cache = new Map<string, string>();
  return {
    get length() {
      return cache.size;
    },
    clear: () => cache.clear(),
    getItem: (key) => cache.get(key) ?? null,
    key: (index) => [...cache.keys()][index] ?? null,
    removeItem: (key) => cache.delete(key),
    setItem: (key, value) => cache.set(key, value),
  };
}

function createCaptureReportFetch(reports: unknown[]): ReportRequestFn {
  return async <T = unknown>(_url: string, options: Parameters<ReportRequestFn>[1]): Promise<T> => {
    reports.push(options);
    return {} as T;
  };
}

async function createBrowserLandingReport(href: string) {
  vi.resetModules();

  const localStorage = createMemoryStorage();
  const sessionStorage = createMemoryStorage();
  const url = new URL(href);
  const location = {
    hash: url.hash,
    href,
    search: url.search,
  };

  vi.stubGlobal('window', {
    localStorage,
    location,
    screen: {
      height: 900,
      width: 1440,
    },
    sessionStorage,
  });
  vi.stubGlobal('localStorage', localStorage);
  vi.stubGlobal('sessionStorage', sessionStorage);
  vi.stubGlobal('navigator', {
    language: 'zh-CN',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  });

  const { createLandingReport } = await import('./createLandingReport');
  return createLandingReport();
}

describe('createLandingReport source normalization', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps normalized url source on every manual landing report', async () => {
    const reports: unknown[] = [];
    const xh = await createBrowserLandingReport('https://www.example.com?channelName=Facebook');

    await xh.init({
      pkg: 'com.example.landing',
      reportFetch: createCaptureReportFetch(reports),
      sourceKeys: ['source', 'channelName'],
      tk: 'user-token',
    });

    expect(reports).toHaveLength(0);

    await xh('landing_view');
    expect(reports[0]).toMatchObject({
      body: [
        {
          ext: {
            channelName: 'Facebook',
            source: 'facebook',
          },
          key: 'landing_view',
        },
      ],
    });

    window.location.href = 'https://www.example.com/next';
    window.location.search = '';
    await xh('cta_click');

    expect(reports[1]).toMatchObject({
      body: [
        {
          ext: {
            channelName: 'Facebook',
            source: 'facebook',
          },
          key: 'cta_click',
        },
      ],
    });
  });
});
