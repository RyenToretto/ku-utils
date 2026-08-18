import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ReportRequestFn } from '../types';

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

async function createBrowserTracker(href: string) {
  vi.resetModules();

  const localStorage = createMemoryStorage();
  const sessionStorage = createMemoryStorage();
  const url = new URL(href);
  const location = {
    hash: url.hash,
    href,
    search: url.search,
  };
  const windowEvents = new EventTarget();

  vi.stubGlobal('window', {
    addEventListener: windowEvents.addEventListener.bind(windowEvents),
    dispatchEvent: windowEvents.dispatchEvent.bind(windowEvents),
    localStorage,
    location,
    removeEventListener: windowEvents.removeEventListener.bind(windowEvents),
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

  const { CoreTracker } = await import('./index');
  return new CoreTracker();
}

describe('CoreTracker source normalization', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('maps configured url keys to normalized ext.source', async () => {
    const reports: unknown[] = [];
    const tracker = await createBrowserTracker('https://www.example.com?channelName=Facebook');

    await tracker.init({
      pkg: 'com.example.app',
      reportFetch: createCaptureReportFetch(reports),
      sourceKeys: ['source', 'channelName'],
      tk: 'user-token',
      version: '1.0.1',
    });
    await vi.waitFor(() => expect(reports.length).toBeGreaterThan(0));

    const request = reports[0] as Parameters<ReportRequestFn>[1];
    const body = request.body as Array<Record<string, unknown>>;
    expect(body[0]).toMatchObject({
      ext: {
        channelName: 'Facebook',
        source: 'facebook',
      },
      key: 'xh_alive',
    });
  });

  it('keeps manually provided ext.source ahead of url source', async () => {
    const reports: unknown[] = [];
    const tracker = await createBrowserTracker('https://www.example.com?channelName=Facebook');

    await tracker.init({
      manual: true,
      pkg: 'com.example.app',
      reportFetch: createCaptureReportFetch(reports),
      sourceKeys: ['source', 'channelName'],
      tk: 'user-token',
    });
    await vi.waitFor(() => expect(reports.length).toBeGreaterThan(0));
    reports.length = 0;
    await tracker.doReport('custom_event', { source: 'Google' });

    expect(reports[0]).toMatchObject({
      body: [
        {
          ext: {
            channelName: 'Facebook',
            source: 'google',
          },
          key: 'custom_event',
        },
      ],
    });
  });

  it('keeps source on later reports after the current url loses channel params', async () => {
    const reports: unknown[] = [];
    const tracker = await createBrowserTracker('https://www.example.com?channelName=Facebook');

    await tracker.init({
      pkg: 'com.example.app',
      reportFetch: createCaptureReportFetch(reports),
      sourceKeys: ['source', 'channelName'],
      tk: 'user-token',
    });
    await vi.waitFor(() => expect(reports.length).toBeGreaterThan(0));

    window.location.href = 'https://www.example.com/dashboard';
    window.location.search = '';
    reports.length = 0;
    await tracker.doReport('custom_event');

    expect(reports[0]).toMatchObject({
      body: [
        {
          ext: {
            channelName: 'Facebook',
            source: 'facebook',
          },
          key: 'custom_event',
        },
      ],
    });
  });
});

describe('CoreTracker reliable event ordering', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('batches the matching alive before reports queued during initialization', async () => {
    const reports: Array<Parameters<ReportRequestFn>[1]> = [];
    const tracker = await createBrowserTracker('https://www.example.com/checkout');
    const pendingPayment = tracker.doReport('pay_suc', { orderId: 'order-1' });

    await tracker.init({
      manual: true,
      pkg: 'com.example.app',
      reportFetch: createCaptureReportFetch(reports),
      tk: 'user-1',
    });
    await pendingPayment;

    expect(reports).toHaveLength(1);
    expect(reports[0]?.body).toMatchObject([
      { key: 'xh_alive' },
      { key: 'xh_heartbeat' },
      { key: 'xh_start' },
      { ext: { orderId: 'order-1' }, key: 'pay_suc' },
    ]);
  });

  it('does not commit an alive marker when transport rejects', async () => {
    const tracker = await createBrowserTracker('https://www.example.com');
    const setupReports: unknown[] = [];

    await tracker.init({
      manual: true,
      pkg: 'com.example.app',
      reportFetch: createCaptureReportFetch(setupReports),
      tk: 'user-1',
    });
    await vi.waitFor(() => expect(setupReports.length).toBeGreaterThan(0));
    localStorage.clear();
    tracker.isDev = false;
    tracker.setReportFetch(async () => {
      throw new Error('offline');
    });

    await expect(tracker._report('xh_alive', {}, true)).rejects.toThrow('offline');

    expect(localStorage.getItem('has_alive')).toBeNull();
  });

  it('does not let a legacy global alive marker suppress a new app token', async () => {
    const reports: unknown[] = [];
    const tracker = await createBrowserTracker('https://www.example.com');
    localStorage.setItem('has_alive', '1');

    await tracker.init({
      manual: true,
      pkg: 'com.example.app',
      reportFetch: createCaptureReportFetch(reports),
      tk: 'user-2',
    });
    await vi.waitFor(() => {
      expect(reports.length).toBeGreaterThan(0);
    });

    expect(reports.some((request) => JSON.stringify(request).includes('"xh_alive"'))).toBe(true);
  });

  it('keeps reporting from memory when browser storage is blocked', async () => {
    const reports: unknown[] = [];
    const tracker = await createBrowserTracker('https://www.example.com');
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });

    await tracker.init({
      manual: true,
      pkg: 'com.example.app',
      reportFetch: createCaptureReportFetch(reports),
      tk: 'user-1',
    });
    await vi.waitFor(() => {
      expect(reports.length).toBeGreaterThan(0);
    });

    const request = reports[0] as Parameters<ReportRequestFn>[1];
    expect((request.body as Array<Record<string, unknown>>)[0]).toMatchObject({
      key: 'xh_alive',
    });
  });

  it('commits a payment order marker only after a successful batch', async () => {
    const reports: unknown[] = [];
    const tracker = await createBrowserTracker('https://www.example.com');
    await tracker.init({
      manual: true,
      pkg: 'com.example.app',
      reportFetch: createCaptureReportFetch(reports),
      tk: 'user-1',
    });
    await vi.waitFor(() => {
      expect(reports.length).toBeGreaterThan(0);
    });
    reports.length = 0;

    await tracker._report('pay_suc', { orderId: 'order-1' });
    await expect(tracker._report('pay_suc', { orderId: 'order-1' })).resolves.toBe(-1);

    expect(reports).toHaveLength(1);
  });

  it('does not commit attr onlyOnce markers when attr transport rejects', async () => {
    const tracker = await createBrowserTracker('https://www.example.com');
    const setupReports: unknown[] = [];
    await tracker.init({
      manual: true,
      pkg: 'com.example.app',
      reportFetch: createCaptureReportFetch(setupReports),
      tk: 'user-1',
    });
    await vi.waitFor(() => expect(setupReports.length).toBeGreaterThan(0));
    tracker.isDev = false;
    tracker.setAttrFetch(async () => {
      throw new Error('offline');
    });

    await expect(tracker.attrReport('profile', {}, true)).rejects.toThrow('offline');

    const successfulFetchMock = vi.fn();
    const successfulFetch: ReportRequestFn = async <T = unknown>() => {
      successfulFetchMock();
      return { ok: true } as T;
    };
    tracker.setAttrFetch(successfulFetch);
    await expect(tracker.attrReport('profile', {}, true)).resolves.toEqual({ ok: true });
    expect(successfulFetchMock).toHaveBeenCalledOnce();
  });

  it.each([
    ['onlyOnce', true],
    ['dedupeKey', { dedupeKey: 'profile-1' }],
  ] as const)('deduplicates concurrent attr reports by %s', async (_label, options) => {
    const tracker = await createBrowserTracker('https://www.example.com');
    const setupReports: unknown[] = [];
    await tracker.init({
      manual: true,
      pkg: 'com.example.app',
      reportFetch: createCaptureReportFetch(setupReports),
      tk: 'user-1',
    });
    await vi.waitFor(() => expect(setupReports.length).toBeGreaterThan(0));

    let releaseAttr: (() => void) | undefined;
    const attrGate = new Promise<void>((resolve) => {
      releaseAttr = resolve;
    });
    const attrFetchMock = vi.fn();
    const attrFetch: ReportRequestFn = async <T = unknown>(): Promise<T> => {
      attrFetchMock();
      await attrGate;
      return { ok: true } as T;
    };
    tracker.setAttrFetch(attrFetch);

    const first = tracker.attrReport('profile', {}, options);
    await vi.waitFor(() => expect(attrFetchMock).toHaveBeenCalledOnce());
    await expect(tracker.attrReport('profile', {}, options)).resolves.toBe(-1);
    releaseAttr?.();
    await first;

    expect(attrFetchMock).toHaveBeenCalledOnce();
  });

  it('does not share in-memory dedupe state across tokens', async () => {
    const reports: unknown[] = [];
    const tracker = await createBrowserTracker('https://www.example.com');
    const reportFetch = createCaptureReportFetch(reports);
    await tracker.init({
      manual: true,
      pkg: 'com.example.app',
      reportFetch,
      tk: 'user-1',
    });
    await tracker._report('purchase', {}, { dedupeKey: 'order-1' });

    await tracker.init({
      manual: true,
      pkg: 'com.example.app',
      reportFetch,
      tk: 'user-2',
    });
    const beforeSecondTokenReport = reports.length;
    await tracker._report('purchase', {}, { dedupeKey: 'order-1' });

    expect(reports.length).toBeGreaterThan(beforeSecondTokenReport);
  });

  it('never invokes transport in development mode, including the alive barrier', async () => {
    const reports: unknown[] = [];
    const tracker = await createBrowserTracker('https://www.example.com');

    await tracker.init({
      isDev: true,
      manual: true,
      pkg: 'com.example.app',
      reportFetch: createCaptureReportFetch(reports),
      tk: 'dev-user',
    });
    await tracker.doReport('custom_event');
    await new Promise((resolve) => setTimeout(resolve, 0));

    const reportPool = (
      tracker as unknown as {
        reportPool: { size: number } | null;
      }
    ).reportPool;
    expect(reports).toEqual([]);
    expect(reportPool?.size ?? 0).toBe(0);
  });

  it('does not automatically send lifecycle events during server-side initialization', async () => {
    vi.unstubAllGlobals();
    vi.resetModules();
    vi.useFakeTimers();
    try {
      const reportFetch = vi.fn(async () => {
        throw new Error('server transport should not run');
      });
      const { CoreTracker } = await import('./index');
      const tracker = new CoreTracker();

      await tracker.init({
        manual: true,
        pkg: 'com.example.ssr',
        reportFetch,
        tk: 'server-user',
      });
      await vi.advanceTimersByTimeAsync(0);

      expect(reportFetch).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('continues draining the previous identity after switching tokens', async () => {
    const attempts: string[] = [];
    let firstIdentityFailed = false;
    const reportFetch: ReportRequestFn = async <T = unknown>(
      _url: string,
      options: Parameters<ReportRequestFn>[1],
    ): Promise<T> => {
      const token = String(options.params?.tk ?? '');
      attempts.push(token);
      if (token === 'user-1' && !firstIdentityFailed) {
        firstIdentityFailed = true;
        throw new Error('temporary offline');
      }
      return { ok: true } as T;
    };
    const tracker = await createBrowserTracker('https://www.example.com');

    await tracker.init({
      manual: true,
      pkg: 'com.example.app',
      reportFetch,
      tk: 'user-1',
    });
    await vi.waitFor(() => expect(attempts.filter((token) => token === 'user-1')).toHaveLength(1));

    await tracker.init({
      manual: true,
      pkg: 'com.example.app',
      reportFetch,
      tk: 'user-2',
    });
    window.dispatchEvent(new Event('online'));

    await vi.waitFor(() =>
      expect(attempts.filter((token) => token === 'user-1').length).toBeGreaterThan(1),
    );
  });

  it('starts dedupe TTL when transport succeeds instead of when the event is queued', async () => {
    let now = 1_000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    let releasePurchase: (() => void) | undefined;
    const purchaseGate = new Promise<void>((resolve) => {
      releasePurchase = resolve;
    });
    let purchaseStarted = false;
    const reportFetch: ReportRequestFn = async <T = unknown>(
      _url: string,
      options: Parameters<ReportRequestFn>[1],
    ): Promise<T> => {
      const body = options.body as Array<{ key?: string }>;
      if (body.some((item) => item.key === 'purchase')) {
        purchaseStarted = true;
        await purchaseGate;
      }
      return { ok: true } as T;
    };
    const tracker = await createBrowserTracker('https://www.example.com');
    await tracker.init({
      manual: true,
      pkg: 'com.example.app',
      reportFetch,
      tk: 'user-1',
    });
    await vi.waitFor(() => expect(purchaseStarted).toBe(false));

    const first = tracker._report('purchase', {}, { dedupeKey: 'order-1', dedupeTtl: 1_000 });
    await vi.waitFor(() => expect(purchaseStarted).toBe(true));
    now = 3_000;
    releasePurchase?.();
    await first;

    await expect(
      tracker._report('purchase', {}, { dedupeKey: 'order-1', dedupeTtl: 1_000 }),
    ).resolves.toBe(-1);
  });

  it('uses the latest report transport after reinitializing the same identity', async () => {
    const firstReports: unknown[] = [];
    const secondReports: unknown[] = [];
    const tracker = await createBrowserTracker('https://www.example.com');
    await tracker.init({
      manual: true,
      pkg: 'com.example.app',
      reportFetch: createCaptureReportFetch(firstReports),
      tk: 'user-1',
    });
    await vi.waitFor(() => expect(firstReports.length).toBeGreaterThan(0));

    await tracker.init({
      manual: true,
      pkg: 'com.example.app',
      reportFetch: createCaptureReportFetch(secondReports),
      tk: 'user-1',
    });
    const firstCount = firstReports.length;
    await tracker._report('after_reinit');

    expect(firstReports).toHaveLength(firstCount);
    expect(secondReports.some((request) => JSON.stringify(request).includes('after_reinit'))).toBe(
      true,
    );
  });

  it('bounds retired pools and later recovers every persisted token identity', async () => {
    const attempts = new Map<string, number>();
    let offline = true;
    const createReportFetch =
      (transportToken: string): ReportRequestFn =>
      async <T = unknown>(_url: string, options: Parameters<ReportRequestFn>[1]): Promise<T> => {
        expect(options.params?.tk).toBe(transportToken);
        attempts.set(transportToken, (attempts.get(transportToken) ?? 0) + 1);
        if (offline) throw new Error('offline');
        return { ok: true } as T;
      };
    const tracker = await createBrowserTracker('https://www.example.com');
    const tokens = Array.from({ length: 7 }, (_, index) => `user-${index + 1}`);

    for (const token of tokens) {
      await tracker.init({
        manual: true,
        pkg: 'com.example.app',
        reportFetch: createReportFetch(token),
        tk: token,
      });
      await vi.waitFor(() => expect(attempts.get(token)).toBe(1));
    }
    const retiredPools = (
      tracker as unknown as {
        retiredReportPools: Set<unknown>;
      }
    ).retiredReportPools;
    expect(retiredPools.size).toBeLessThanOrEqual(4);

    offline = false;
    window.dispatchEvent(new Event('online'));

    await vi.waitFor(
      () => {
        for (const token of tokens) expect(attempts.get(token)).toBeGreaterThan(1);
      },
      { timeout: 5_000 },
    );
  });

  it('keeps the retired pool cap when several transports are simultaneously pending', async () => {
    let releaseTransports: (() => void) | undefined;
    const transportGate = new Promise<void>((resolve) => {
      releaseTransports = resolve;
    });
    const started = new Set<string>();
    const reportFetch: ReportRequestFn = async <T = unknown>(
      _url: string,
      options: Parameters<ReportRequestFn>[1],
    ): Promise<T> => {
      started.add(String(options.params?.tk ?? ''));
      await transportGate;
      return { ok: true } as T;
    };
    const tracker = await createBrowserTracker('https://www.example.com');

    for (let index = 1; index <= 7; index += 1) {
      const token = `pending-user-${index}`;
      await tracker.init({
        manual: true,
        pkg: 'com.example.app',
        reportFetch,
        tk: token,
      });
      await vi.waitFor(() => expect(started.has(token)).toBe(true));
    }
    const retiredPools = (
      tracker as unknown as {
        retiredReportPools: Set<unknown>;
      }
    ).retiredReportPools;
    expect(retiredPools.size).toBeLessThanOrEqual(4);

    releaseTransports?.();
    await vi.waitFor(() => expect(retiredPools.size).toBe(0));
    const dormantTransports = (
      tracker as unknown as {
        dormantReportTransports: Map<string, unknown>;
      }
    ).dormantReportTransports;
    expect(dormantTransports.size).toBe(0);
  });
});
