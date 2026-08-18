import type { ReportEventStorage } from './reportEventStorage';

export interface ReportCommitMarker {
  key: string;
  storage: 'local' | 'session';
  value: string;
}

export interface PooledReportEvent {
  id: string;
  dedupeId?: string;
  dedupeTtl?: number;
  url: string;
  body: {
    key: string;
    ext: Record<string, unknown>;
    ts: number;
  };
  params: Record<string, unknown>;
  commitMarkers: ReportCommitMarker[];
  createdAt: number;
  attempts?: number;
  nextRetryAt?: number;
}

interface PendingPromise {
  event: PooledReportEvent;
  reject: (reason?: unknown) => void;
  resolve: (value: unknown) => void;
}

export interface ReportEventPoolOptions {
  namespace: string;
  storage: ReportEventStorage;
  send: (events: PooledReportEvent[], params: Record<string, unknown>) => Promise<unknown>;
  barrierKey?: string;
  onIdle?: () => void;
  onSettled?: () => void;
  onSuccess?: (events: PooledReportEvent[]) => void;
  batchSize?: number;
  autoFlush?: boolean;
  sendTimeout?: number;
}

const RETRY_DELAYS = [1_000, 2_000, 4_000, 8_000, 16_000, 30_000];
const DEFAULT_SEND_TIMEOUT = 30_000;

async function withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error('Report transport timed out')), timeout);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function createOwnerId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function makeTransportKey(event: PooledReportEvent): string {
  const stableParams = Object.entries(event.params)
    .filter(([key]) => key !== 'ts')
    .sort(([left], [right]) => left.localeCompare(right));
  return `${event.url}\u0000${JSON.stringify(stableParams)}`;
}

function makeCompletionKey(event: PooledReportEvent): string {
  return event.dedupeId ? `dedupe:${event.dedupeId}` : `event:${event.id}`;
}

/**
 * 关键事件持久化 FIFO 池。同一时刻只允许一个 flush；
 * transport resolve 后才删除事件并提交业务标记。
 */
export class ReportEventPool {
  private queue: PooledReportEvent[];
  private readonly pending = new Map<string, PendingPromise>();
  private readonly persistedIds = new Set<string>();
  private readonly owner = createOwnerId();
  private readonly batchSize: number;
  private readonly autoFlush: boolean;
  private flushing: Promise<void> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private disposed = false;

  constructor(private readonly options: ReportEventPoolOptions) {
    this.batchSize = options.batchSize ?? 20;
    this.autoFlush = options.autoFlush ?? true;
    this.queue = options.storage.read();
    for (const event of this.queue) this.persistedIds.add(event.id);

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('online', this.handleRecovery);
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', this.handleRecovery);
      }
    }

    if (this.autoFlush && this.queue.length > 0) {
      this.scheduleFlush(Math.max(0, (this.queue[0]?.nextRetryAt ?? 0) - Date.now()));
    }
  }

  get size(): number {
    return this.queue.length;
  }

  get isFlushing(): boolean {
    return this.flushing !== null;
  }

  hasDedupeId(dedupeId: string): boolean {
    return this.queue.some((event) => event.dedupeId === dedupeId);
  }

  enqueue(event: PooledReportEvent, prepend = false): Promise<unknown> {
    if (this.disposed) return Promise.reject(new Error('Report event pool disposed'));
    this.syncFromStorage();
    if (event.dedupeId && this.hasDedupeId(event.dedupeId)) return Promise.resolve(-1);

    if (prepend) this.queue.unshift(event);
    else this.queue.push(event);
    if (this.options.storage.append(event)) this.persistedIds.add(event.id);

    const promise = new Promise<unknown>((resolve, reject) => {
      this.pending.set(event.id, { event, reject, resolve });
    });
    if (this.autoFlush) this.scheduleFlush();
    return promise;
  }

  flush(force = true): Promise<void> {
    if (this.disposed) return Promise.resolve();
    if (this.flushing) return this.flushing;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    this.flushing = this.flushQueue(force)
      .catch((error: unknown) => {
        if (this.autoFlush && !this.disposed) {
          this.scheduleFlush(Math.max(0, (this.queue[0]?.nextRetryAt ?? Date.now()) - Date.now()));
        }
        throw error;
      })
      .finally(() => {
        this.flushing = null;
        this.options.onSettled?.();
      });
    return this.flushing;
  }

  dispose(reason: unknown = new Error('Report event pool disposed')): void {
    this.disposed = true;
    if (this.retryTimer) clearTimeout(this.retryTimer);
    for (const pending of this.pending.values()) pending.reject(reason);
    this.pending.clear();
    if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
      window.removeEventListener('online', this.handleRecovery);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', this.handleRecovery);
      }
    }
  }

  private readonly handleRecovery = (): void => {
    if (this.disposed) return;
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    void this.flush(true).catch(() => {
      // flush() schedules a retry without reviving stale in-memory records.
    });
  };

  private syncFromStorage(): void {
    const snapshot = this.options.storage.readSnapshot();
    if (!snapshot.readable) return;
    const stored = snapshot.events;
    const storedIds = new Set(stored.map((event) => event.id));
    const storedCompletionKeys = new Set(stored.map(makeCompletionKey));
    for (const [id, pending] of this.pending) {
      if (!storedIds.has(id) && this.options.storage.isAcknowledged(pending.event)) {
        pending.resolve(undefined);
        this.pending.delete(id);
      }
    }
    const memoryOnly = this.queue.filter((event) => {
      if (storedIds.has(event.id) || this.options.storage.isAcknowledged(event)) return false;
      return !storedCompletionKeys.has(makeCompletionKey(event));
    });
    for (const event of memoryOnly) this.options.storage.append(event);
    this.queue = [...stored, ...memoryOnly].sort(
      (left, right) => left.createdAt - right.createdAt || left.id.localeCompare(right.id),
    );
    this.persistedIds.clear();
    for (const event of this.queue) this.persistedIds.add(event.id);
  }

  private scheduleFlush(delay = 0, replace = false): void {
    if (this.disposed) return;
    if (this.retryTimer) {
      if (!replace) return;
      clearTimeout(this.retryTimer);
    }
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      void this.flush(false).catch(() => {
        // flush() has already scheduled the next retry.
      });
    }, delay);
  }

  private async flushQueue(force: boolean): Promise<void> {
    if (
      typeof navigator !== 'undefined' &&
      navigator.locks &&
      typeof navigator.locks.request === 'function'
    ) {
      let callbackStarted = false;
      try {
        await navigator.locks.request(`ku-utils-report:${this.options.namespace}`, async () => {
          callbackStarted = true;
          await this.flushBatches(force, () => true);
        });
        if (callbackStarted) return;
      } catch (error) {
        if (callbackStarted) throw error;
        // Restricted contexts may expose Web Locks but reject before callback execution.
      }
    }
    await this.flushWithLease(force);
  }

  private async flushWithLease(force: boolean): Promise<void> {
    if (this.disposed) return;
    if (!(await this.options.storage.acquireLease(this.owner))) {
      if (this.autoFlush) this.scheduleFlush(RETRY_DELAYS[0]);
      return;
    }

    const leaseRenewal = setInterval(() => {
      this.options.storage.renewLease(this.owner);
    }, 3_000);
    try {
      await this.flushBatches(force, () => this.options.storage.hasLease(this.owner));
    } finally {
      clearInterval(leaseRenewal);
      this.options.storage.releaseLease(this.owner);
    }
  }

  private async flushBatches(force: boolean, ownsLock: () => boolean): Promise<void> {
    this.syncFromStorage();
    if (this.queue.length === 0) {
      this.options.onIdle?.();
      return;
    }
    while (!this.disposed && this.queue.length > 0) {
      const barrier = this.options.barrierKey
        ? this.queue.find((event) => event.body.key === this.options.barrierKey)
        : undefined;
      const first = barrier ?? this.queue[0];
      if (!force && first?.nextRetryAt && first.nextRetryAt > Date.now()) {
        if (this.autoFlush) this.scheduleFlush(first.nextRetryAt - Date.now());
        return;
      }
      const transportKey = first ? makeTransportKey(first) : '';
      const batch: PooledReportEvent[] = [];
      const batchCompletionKeys = new Set<string>();
      const candidates = barrier
        ? [barrier, ...this.queue.filter((event) => event.id !== barrier.id)]
        : this.queue;
      for (const event of candidates) {
        if (makeTransportKey(event) !== transportKey) break;
        const completionKey = makeCompletionKey(event);
        if (batchCompletionKeys.has(completionKey)) continue;
        if (batch.length >= this.batchSize) break;
        batch.push(event);
        batchCompletionKeys.add(completionKey);
      }
      const params = { ...batch[0]?.params, ts: Date.now() };
      let result: unknown;
      try {
        result = await withTimeout(
          this.options.send(batch, params),
          this.options.sendTimeout ?? DEFAULT_SEND_TIMEOUT,
        );
      } catch (error) {
        this.markBatchFailed(batchCompletionKeys, error);
        throw error;
      }

      if (!ownsLock()) {
        const error = new Error('Report event pool lease lost');
        this.markBatchFailed(batchCompletionKeys, error);
        throw error;
      }
      const completedEvents = this.queue.filter((event) =>
        batchCompletionKeys.has(makeCompletionKey(event)),
      );
      this.options.storage.complete(completedEvents);
      this.queue = this.queue.filter((event) => !batchCompletionKeys.has(makeCompletionKey(event)));
      for (const event of completedEvents) this.persistedIds.delete(event.id);
      try {
        this.options.onSuccess?.(completedEvents);
      } catch (error) {
        for (const [id, pending] of this.pending) {
          if (!batchCompletionKeys.has(makeCompletionKey(pending.event))) continue;
          pending.reject(error);
          this.pending.delete(id);
        }
        throw error;
      }
      for (const [id, pending] of this.pending) {
        if (!batchCompletionKeys.has(makeCompletionKey(pending.event))) continue;
        pending.resolve(result);
        this.pending.delete(id);
      }
    }
    if (!this.disposed) this.options.onIdle?.();
  }

  private markBatchFailed(completionKeys: Set<string>, error: unknown): void {
    const failedEvents: PooledReportEvent[] = [];
    this.queue = this.queue.map((event) => {
      if (!completionKeys.has(makeCompletionKey(event))) return event;
      const attempts = (event.attempts ?? 0) + 1;
      const retryDelay = RETRY_DELAYS[Math.min(attempts - 1, RETRY_DELAYS.length - 1)];
      const failedEvent = { ...event, attempts, nextRetryAt: Date.now() + retryDelay };
      failedEvents.push(failedEvent);
      return failedEvent;
    });
    this.options.storage.update(failedEvents);
    for (const [id, pending] of this.pending) {
      if (!completionKeys.has(makeCompletionKey(pending.event))) continue;
      pending.reject(error);
      this.pending.delete(id);
    }
  }
}
