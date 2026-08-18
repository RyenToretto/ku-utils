import { afterEach, describe, expect, it, vi } from 'vitest';

import { ReportEventPool, type PooledReportEvent } from './reportEventPool';
import { ReportEventStorage } from './reportEventStorage';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

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

function event(id: string, key: string): PooledReportEvent {
  return {
    body: { ext: {}, key, ts: 1 },
    commitMarkers: [],
    createdAt: 1,
    dedupeId: id,
    id,
    params: { app: 'app', tk: 'token', ts: 1 },
    url: '/adtrack',
  };
}

describe('ReportEventPool', () => {
  it('sends queued events in FIFO batches', async () => {
    const sent: PooledReportEvent[][] = [];
    const pool = new ReportEventPool({
      autoFlush: false,
      namespace: 'app-token',
      send: async (events) => {
        sent.push(events);
        return { ok: true };
      },
      storage: new ReportEventStorage('app-token', createMemoryStorage()),
    });

    const first = pool.enqueue(event('1', 'xh_alive'));
    const second = pool.enqueue(event('2', 'pay_suc'));
    await pool.flush();

    await expect(first).resolves.toEqual({ ok: true });
    await expect(second).resolves.toEqual({ ok: true });
    expect(sent[0]?.map((item) => item.body.key)).toEqual(['xh_alive', 'pay_suc']);
  });

  it('retains a rejected batch and restores it after page recreation', async () => {
    const storage = createMemoryStorage();
    const firstPool = new ReportEventPool({
      autoFlush: false,
      namespace: 'app-token',
      send: async () => {
        throw new Error('offline');
      },
      storage: new ReportEventStorage('app-token', storage),
    });

    const result = firstPool.enqueue(event('1', 'xh_alive'));
    await expect(firstPool.flush()).rejects.toThrow('offline');
    await expect(result).rejects.toThrow('offline');

    const send = vi.fn(async (_events: PooledReportEvent[]) => ({ ok: true }));
    const restoredPool = new ReportEventPool({
      autoFlush: false,
      namespace: 'app-token',
      send,
      storage: new ReportEventStorage('app-token', storage),
    });
    await restoredPool.flush();

    expect(send).toHaveBeenCalledOnce();
    expect(send.mock.calls[0]?.[0]).toMatchObject([{ id: '1' }]);
    expect(new ReportEventStorage('app-token', storage).read()).toEqual([]);
  });

  it('does not enqueue the same dedupe id twice while it is pending', async () => {
    const pool = new ReportEventPool({
      autoFlush: false,
      namespace: 'app-token',
      send: async () => ({ ok: true }),
      storage: new ReportEventStorage('app-token', createMemoryStorage()),
    });

    const first = pool.enqueue(event('1', 'pay_suc'));
    await expect(pool.enqueue({ ...event('2', 'pay_suc'), dedupeId: '1' })).resolves.toBe(-1);
    await pool.flush();
    await first;

    expect(pool.size).toBe(0);
  });

  it('splits large queues into bounded FIFO batches', async () => {
    const batchSizes: number[] = [];
    const pool = new ReportEventPool({
      autoFlush: false,
      batchSize: 2,
      namespace: 'app-token',
      send: async (events) => {
        batchSizes.push(events.length);
        return { ok: true };
      },
      storage: new ReportEventStorage('app-token', createMemoryStorage()),
    });

    const results = [
      pool.enqueue(event('1', 'event-1')),
      pool.enqueue(event('2', 'event-2')),
      pool.enqueue(event('3', 'event-3')),
    ];
    await pool.flush();
    await Promise.all(results);

    expect(batchSizes).toEqual([2, 1]);
  });

  it('uses a storage lease to prevent duplicate cross-tab sends', async () => {
    const storage = createMemoryStorage();
    let releaseSend: (() => void) | undefined;
    const firstSend = new Promise<void>((resolve) => {
      releaseSend = resolve;
    });
    const firstPool = new ReportEventPool({
      autoFlush: false,
      namespace: 'app-token',
      send: async () => {
        await firstSend;
        return { ok: true };
      },
      storage: new ReportEventStorage('app-token', storage),
    });
    const pending = firstPool.enqueue(event('1', 'xh_alive'));
    const secondSend = vi.fn(async (_events: PooledReportEvent[]) => ({ ok: true }));
    const secondPool = new ReportEventPool({
      autoFlush: false,
      namespace: 'app-token',
      send: secondSend,
      storage: new ReportEventStorage('app-token', storage),
    });

    const firstFlush = firstPool.flush();
    await secondPool.flush();
    expect(secondSend).not.toHaveBeenCalled();

    releaseSend?.();
    await firstFlush;
    await pending;
    await secondPool.flush();
    expect(secondSend).not.toHaveBeenCalled();
  });

  it('preserves events added by another tab while a batch is in flight', async () => {
    const storage = createMemoryStorage();
    let releaseSend: (() => void) | undefined;
    const firstSend = new Promise<void>((resolve) => {
      releaseSend = resolve;
    });
    const sentByFirst: string[] = [];
    const firstPool = new ReportEventPool({
      autoFlush: false,
      namespace: 'app-token',
      send: async (events) => {
        sentByFirst.push(...events.map((item) => item.id));
        await firstSend;
        return { ok: true };
      },
      storage: new ReportEventStorage('app-token', storage),
    });
    const firstResult = firstPool.enqueue(event('1', 'xh_alive'));
    const firstFlush = firstPool.flush();

    const secondPool = new ReportEventPool({
      autoFlush: false,
      namespace: 'app-token',
      send: async () => ({ ok: true }),
      storage: new ReportEventStorage('app-token', storage),
    });
    void secondPool.enqueue(event('2', 'pay_suc')).catch(() => {
      // Simulate the tab closing while its event remains persisted.
    });
    secondPool.dispose();

    releaseSend?.();
    await firstFlush;
    await firstResult;

    const restoredSend = vi.fn(async (_events: PooledReportEvent[]) => ({ ok: true }));
    const restoredPool = new ReportEventPool({
      autoFlush: false,
      namespace: 'app-token',
      send: restoredSend,
      storage: new ReportEventStorage('app-token', storage),
    });
    await restoredPool.flush();

    const restoredIds = restoredSend.mock.calls.flatMap(
      (call) => call[0]?.map((item) => item.id) ?? [],
    );
    expect([...sentByFirst, ...restoredIds].filter((id) => id === '2')).toHaveLength(1);
  });

  it('rejects live callers but preserves events when a pool is disposed', async () => {
    const storage = createMemoryStorage();
    const pool = new ReportEventPool({
      autoFlush: false,
      namespace: 'app-token',
      send: async () => ({ ok: true }),
      storage: new ReportEventStorage('app-token', storage),
    });
    const pending = pool.enqueue(event('1', 'pay_suc'));

    pool.dispose(new Error('identity changed'));

    await expect(pending).rejects.toThrow('identity changed');
    expect(new ReportEventStorage('app-token', storage).read()).toMatchObject([{ id: '1' }]);
  });

  it('quarantines malformed persisted event records', () => {
    const storage = createMemoryStorage();
    const key = '__ku_utils_report_pool__:app-token:record:event:broken';
    storage.setItem(key, JSON.stringify({ id: 'broken' }));
    const eventStorage = new ReportEventStorage('app-token', storage);

    expect(eventStorage.read()).toEqual([]);
    expect(storage.getItem(key)).toBeNull();
  });

  it('stores the same cross-tab dedupe id as one deterministic record', async () => {
    const storage = createMemoryStorage();
    const sentIds: string[] = [];
    const createPool = () =>
      new ReportEventPool({
        autoFlush: false,
        namespace: 'app-token',
        send: async (events) => {
          sentIds.push(...events.map((item) => item.id));
          return { ok: true };
        },
        storage: new ReportEventStorage('app-token', storage),
      });
    const firstPool = createPool();
    const secondPool = createPool();
    const first = firstPool.enqueue(event('1', 'pay_suc'));
    const second = secondPool.enqueue({ ...event('2', 'pay_suc'), dedupeId: '1' });

    await firstPool.flush();
    await secondPool.flush();
    await Promise.all([first, second]);

    expect(sentIds).toHaveLength(1);
  });

  it('uses Web Locks without applying the fallback lease timeout', async () => {
    vi.stubGlobal('navigator', {
      locks: {
        request: async (_name: string, callback: () => Promise<void>) => callback(),
      },
    });
    const eventStorage = new ReportEventStorage('app-token', createMemoryStorage());
    const acquireLease = vi.spyOn(eventStorage, 'acquireLease');
    const send = vi.fn(async (_events: PooledReportEvent[]) => ({ ok: true }));
    const pool = new ReportEventPool({
      autoFlush: false,
      namespace: 'app-token',
      send,
      storage: eventStorage,
    });
    const pending = pool.enqueue(event('1', 'xh_alive'));

    await pool.flush();
    await pending;

    expect(send).toHaveBeenCalledOnce();
    expect(acquireLease).not.toHaveBeenCalled();
  });

  it('falls back when Web Locks rejects before entering the callback', async () => {
    vi.stubGlobal('navigator', {
      locks: {
        request: async () => {
          throw new Error('locks unavailable');
        },
      },
    });
    const eventStorage = new ReportEventStorage('app-token', createMemoryStorage());
    const acquireLease = vi.spyOn(eventStorage, 'acquireLease');
    const pool = new ReportEventPool({
      autoFlush: false,
      namespace: 'app-token',
      send: async () => ({ ok: true }),
      storage: eventStorage,
    });
    const pending = pool.enqueue(event('1', 'xh_alive'));

    await pool.flush();
    await pending;

    expect(acquireLease).toHaveBeenCalledOnce();
  });

  it('does not treat an externally deleted record as a successful send', async () => {
    const storage = createMemoryStorage();
    const send = vi.fn(async (_events: PooledReportEvent[]) => ({ ok: true }));
    const pool = new ReportEventPool({
      autoFlush: false,
      namespace: 'app-token',
      send,
      storage: new ReportEventStorage('app-token', storage),
    });
    const pending = pool.enqueue(event('1', 'pay_suc'));
    storage.clear();

    await pool.flush();

    await expect(pending).resolves.toEqual({ ok: true });
    expect(send).toHaveBeenCalledOnce();
    expect(send.mock.calls[0]?.[0]).toMatchObject([{ id: '1' }]);
  });

  it('persists retry backoff when the fallback lease is lost after transport resolves', async () => {
    const storage = createMemoryStorage();
    const eventStorage = new ReportEventStorage('app-token', storage);
    vi.spyOn(eventStorage, 'hasLease').mockReturnValue(false);
    const pool = new ReportEventPool({
      autoFlush: false,
      namespace: 'app-token',
      send: async () => ({ ok: true }),
      storage: eventStorage,
    });
    const pending = pool.enqueue(event('1', 'pay_suc'));

    await expect(pool.flush()).rejects.toThrow('lease lost');
    await expect(pending).rejects.toThrow('lease lost');

    const restored = eventStorage.read();
    expect(restored[0]?.attempts).toBe(1);
    expect(restored[0]?.nextRetryAt).toBeGreaterThan(Date.now());
  });

  it('restores persisted records in strict creation order', () => {
    const storage = createMemoryStorage();
    const eventStorage = new ReportEventStorage('app-token', storage);
    eventStorage.append({ ...event('business', 'custom_event'), createdAt: 1 });
    eventStorage.append({ ...event('alive', 'xh_alive'), createdAt: 2 });

    expect(eventStorage.read().map((item) => item.id)).toEqual(['business', 'alive']);
  });

  it('sends a required alive barrier before older restored business events', async () => {
    const storage = createMemoryStorage();
    const eventStorage = new ReportEventStorage('app-token', storage);
    eventStorage.append({ ...event('business', 'pay_suc'), createdAt: 1 });
    eventStorage.append({ ...event('alive', 'xh_alive'), createdAt: 2 });
    const sent: string[] = [];
    const pool = new ReportEventPool({
      autoFlush: false,
      barrierKey: 'xh_alive',
      namespace: 'app-token',
      send: async (events) => {
        sent.push(...events.map((item) => item.body.key));
        return { ok: true };
      },
      storage: eventStorage,
    });

    await pool.flush();

    expect(sent).toEqual(['xh_alive', 'pay_suc']);
  });

  it('does not apply an older dedupe acknowledgement to a newer event generation', () => {
    const storage = createMemoryStorage();
    const eventStorage = new ReportEventStorage('app-token', storage);
    const first = { ...event('first', 'pay_suc'), createdAt: 100, dedupeId: 'order-1' };
    vi.spyOn(Date, 'now').mockReturnValue(200);
    eventStorage.append(first);
    eventStorage.complete([first]);
    const next = { ...event('next', 'pay_suc'), createdAt: 201, dedupeId: 'order-1' };

    expect(eventStorage.isAcknowledged(next, 202)).toBe(false);
  });

  it('removes expired acknowledgement records during storage reads', () => {
    const storage = createMemoryStorage();
    const eventStorage = new ReportEventStorage('app-token', storage);
    const completed = event('1', 'custom_event');
    vi.spyOn(Date, 'now').mockReturnValue(100);
    eventStorage.append(completed);
    eventStorage.complete([completed]);
    vi.spyOn(Date, 'now').mockReturnValue(10 * 60_000);

    eventStorage.read();

    const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index));
    expect(keys.some((key) => key?.includes(':ack:'))).toBe(false);
  });

  it('caps acknowledgement records during a single large completion', () => {
    const storage = createMemoryStorage();
    const eventStorage = new ReportEventStorage('app-token', storage);
    const completed = Array.from({ length: 2_100 }, (_, index) =>
      event(String(index), 'custom_event'),
    );

    eventStorage.complete(completed);

    const ackCount = Array.from({ length: storage.length }, (_, index) =>
      storage.key(index),
    ).filter((key) => key?.includes(':ack:')).length;
    expect(ackCount).toBeLessThanOrEqual(2_048);
  });

  it('times out a transport that never settles', async () => {
    vi.useFakeTimers();
    const pool = new ReportEventPool({
      autoFlush: false,
      namespace: 'app-token',
      send: () => new Promise(() => undefined),
      sendTimeout: 100,
      storage: new ReportEventStorage('app-token', createMemoryStorage()),
    });
    const pending = pool.enqueue(event('1', 'pay_suc'));
    const flush = pool.flush();
    const flushExpectation = expect(flush).rejects.toThrow('timed out');
    const pendingExpectation = expect(pending).rejects.toThrow('timed out');
    await vi.advanceTimersByTimeAsync(250);

    await flushExpectation;
    await pendingExpectation;
  });
});
