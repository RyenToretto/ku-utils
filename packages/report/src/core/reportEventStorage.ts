import type { PooledReportEvent } from './reportEventPool';

const POOL_PREFIX = '__ku_utils_report_pool__';
const LEASE_TTL = 10_000;
const LEASE_SETTLE_DELAY = 20;
const ACK_TTL = 5 * 60_000;
const ACK_LIMIT = 2_048;

export function listReportEventNamespaces(storage: Storage | null, app: string): string[] {
  if (!storage) return [];
  const prefix = `${POOL_PREFIX}:`;
  const separator = ':record:';
  const namespaces = new Set<string>();
  try {
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key?.startsWith(prefix)) continue;
      const separatorIndex = key.indexOf(separator, prefix.length);
      if (separatorIndex < 0) continue;
      const event = parseJson<unknown>(storage.getItem(key), null);
      if (!isPooledReportEvent(event) || event.params.app !== app) continue;
      namespaces.add(key.slice(prefix.length, separatorIndex));
    }
  } catch {
    return [];
  }
  return [...namespaces];
}

interface LeaseRecord {
  expiresAt: number;
  owner: string;
}

export interface ReportEventStorageSnapshot {
  events: PooledReportEvent[];
  readable: boolean;
}

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCommitMarker(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.key === 'string' &&
    (value.storage === 'local' || value.storage === 'session') &&
    typeof value.value === 'string'
  );
}

function isPooledReportEvent(value: unknown): value is PooledReportEvent {
  if (!isRecord(value) || !isRecord(value.body)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.url === 'string' &&
    typeof value.createdAt === 'number' &&
    Number.isFinite(value.createdAt) &&
    isRecord(value.params) &&
    Array.isArray(value.commitMarkers) &&
    value.commitMarkers.every(isCommitMarker) &&
    typeof value.body.key === 'string' &&
    typeof value.body.ts === 'number' &&
    Number.isFinite(value.body.ts) &&
    isRecord(value.body.ext) &&
    (value.dedupeId === undefined || typeof value.dedupeId === 'string') &&
    (value.dedupeTtl === undefined ||
      (typeof value.dedupeTtl === 'number' &&
        Number.isFinite(value.dedupeTtl) &&
        value.dedupeTtl >= 0)) &&
    (value.attempts === undefined ||
      (typeof value.attempts === 'number' &&
        Number.isInteger(value.attempts) &&
        value.attempts >= 0)) &&
    (value.nextRetryAt === undefined ||
      (typeof value.nextRetryAt === 'number' && Number.isFinite(value.nextRetryAt)))
  );
}

/**
 * 每条事件使用独立 localStorage 记录，避免多个标签页通过整数组
 * read-modify-write 时互相覆盖。localStorage 不可用时由事件池保留内存副本。
 */
export class ReportEventStorage {
  private readonly recordPrefix: string;
  private readonly ackPrefix: string;
  private readonly leaseKey: string;

  constructor(
    namespace: string,
    private readonly storage: Storage | null = typeof localStorage === 'undefined'
      ? null
      : localStorage,
  ) {
    const namespacePrefix = `${POOL_PREFIX}:${namespace}`;
    this.recordPrefix = `${namespacePrefix}:record:`;
    this.ackPrefix = `${namespacePrefix}:ack:`;
    this.leaseKey = `${namespacePrefix}:lease`;
  }

  read(): PooledReportEvent[] {
    return this.readSnapshot().events;
  }

  readSnapshot(): ReportEventStorageSnapshot {
    if (!this.storage) return { events: [], readable: false };
    try {
      const keys: string[] = [];
      for (let index = 0; index < this.storage.length; index += 1) {
        const key = this.storage.key(index);
        if (key?.startsWith(this.recordPrefix)) keys.push(key);
      }
      this.cleanupAcknowledgements();

      const events: PooledReportEvent[] = [];
      for (const key of keys) {
        const value = parseJson<unknown>(this.storage.getItem(key), null);
        if (isPooledReportEvent(value)) events.push(value);
        else this.storage.removeItem(key);
      }
      const sortedEvents = events.sort(
        (left, right) => left.createdAt - right.createdAt || left.id.localeCompare(right.id),
      );
      return { events: sortedEvents, readable: true };
    } catch {
      return { events: [], readable: false };
    }
  }

  append(event: PooledReportEvent): boolean {
    if (!this.storage) return false;
    try {
      this.storage.setItem(this.recordKey(event), JSON.stringify(event));
      return true;
    } catch {
      return false;
    }
  }

  update(events: PooledReportEvent[]): void {
    if (!this.storage) return;
    for (const event of events) this.append(event);
  }

  remove(events: Iterable<PooledReportEvent>): void {
    if (!this.storage) return;
    try {
      for (const event of events) this.storage.removeItem(this.recordKey(event));
    } catch {
      // A later restore may retry an already accepted event (at-least-once).
    }
  }

  complete(events: Iterable<PooledReportEvent>): void {
    if (!this.storage) return;
    try {
      const completedAt = Date.now();
      for (const event of events) {
        this.storage.setItem(this.ackKey(event), String(completedAt));
        this.storage.removeItem(this.recordKey(event));
      }
      this.cleanupAcknowledgements(completedAt);
    } catch {
      // A later restore may retry an already accepted event (at-least-once).
    }
  }

  isAcknowledged(event: PooledReportEvent, now = Date.now()): boolean {
    if (!this.storage) return false;
    try {
      const key = this.ackKey(event);
      const completedAt = Number(this.storage.getItem(key));
      if (
        Number.isFinite(completedAt) &&
        completedAt >= event.createdAt &&
        now - completedAt <= ACK_TTL
      ) {
        return true;
      }
      if (completedAt > 0) this.storage.removeItem(key);
      return false;
    } catch {
      return false;
    }
  }

  async acquireLease(owner: string, now = Date.now()): Promise<boolean> {
    if (!this.storage) return true;
    try {
      const current = parseJson<LeaseRecord | null>(this.storage.getItem(this.leaseKey), null);
      if (current && current.owner !== owner && current.expiresAt > now) return false;

      const next: LeaseRecord = { expiresAt: now + LEASE_TTL, owner };
      this.storage.setItem(this.leaseKey, JSON.stringify(next));
      await new Promise((resolve) => setTimeout(resolve, LEASE_SETTLE_DELAY));
      const saved = parseJson<LeaseRecord | null>(this.storage.getItem(this.leaseKey), null);
      return saved?.owner === owner && saved.expiresAt > Date.now();
    } catch {
      return true;
    }
  }

  renewLease(owner: string, now = Date.now()): boolean {
    if (!this.storage) return true;
    try {
      const current = parseJson<LeaseRecord | null>(this.storage.getItem(this.leaseKey), null);
      if (current?.owner !== owner) return false;
      this.storage.setItem(
        this.leaseKey,
        JSON.stringify({ expiresAt: now + LEASE_TTL, owner } satisfies LeaseRecord),
      );
      return true;
    } catch {
      return true;
    }
  }

  hasLease(owner: string, now = Date.now()): boolean {
    if (!this.storage) return true;
    try {
      const current = parseJson<LeaseRecord | null>(this.storage.getItem(this.leaseKey), null);
      return current?.owner === owner && current.expiresAt > now;
    } catch {
      return true;
    }
  }

  releaseLease(owner: string): void {
    if (!this.storage) return;
    try {
      const current = parseJson<LeaseRecord | null>(this.storage.getItem(this.leaseKey), null);
      if (current?.owner === owner) this.storage.removeItem(this.leaseKey);
    } catch {
      // localStorage may be blocked; the lease expires automatically.
    }
  }

  private recordKey(event: PooledReportEvent): string {
    const identity = event.dedupeId
      ? `dedupe:${encodeURIComponent(event.dedupeId)}`
      : `event:${encodeURIComponent(event.id)}`;
    return `${this.recordPrefix}${identity}`;
  }

  private ackKey(event: PooledReportEvent): string {
    const identity = event.dedupeId
      ? `dedupe:${encodeURIComponent(event.dedupeId)}`
      : `event:${encodeURIComponent(event.id)}`;
    return `${this.ackPrefix}${identity}`;
  }

  private cleanupAcknowledgements(now = Date.now()): void {
    if (!this.storage) return;
    const acknowledgements: Array<{ completedAt: number; key: string }> = [];
    for (let index = 0; index < this.storage.length; index += 1) {
      const key = this.storage.key(index);
      if (!key?.startsWith(this.ackPrefix)) continue;
      acknowledgements.push({
        completedAt: Number(this.storage.getItem(key)),
        key,
      });
    }
    const activeAcknowledgements = acknowledgements
      .filter(({ completedAt, key }) => {
        const active =
          Number.isFinite(completedAt) && completedAt > 0 && now - completedAt <= ACK_TTL;
        if (!active) this.storage?.removeItem(key);
        return active;
      })
      .sort((left, right) => right.completedAt - left.completedAt);
    for (const { key } of activeAcknowledgements.slice(ACK_LIMIT)) {
      this.storage.removeItem(key);
    }
  }
}
