/**
 * 埋点上报核心模块
 */
import {
  doDate,
  getBrowserInfo,
  getPageParams,
  isClient,
  isDefined,
  ktk,
  makeVersionCode,
  safeParseJson,
  useToken,
  uuid,
} from '@ku-utils/utils';

import type {
  ReportOnceOrOptions,
  ReportOptions,
  ReportParams,
  ReportRequestFn,
  TrackerConfig,
} from '../types';
import { SDK_VERSION } from '../version';

import { defaultReportFetch } from './defaultReportFetch';
import { buildMergedExtPayload } from './reportContext';
import { type PooledReportEvent, ReportEventPool } from './reportEventPool';
import { listReportEventNamespaces, ReportEventStorage } from './reportEventStorage';
import {
  buildReportCommitMarkers,
  commitReportMarkers,
  hasCommittedReportMarker,
  makeReportIdentity,
  resolveXhStorageKey,
  shouldSkipAttrReportKey,
  type StorageAccessor,
} from './reportGuards';
import {
  normalizeSourceChannel,
  normalizeSourceKeys,
  resolveSourceFromParams,
} from './sourceChannel';

export { ktk, makeVersionCode, useToken, uuid };

interface KeyValue<T = string> {
  key: string;
  value: T;
}

const noneFunc = (): Record<string, unknown> => ({});

function getClientStorageAccessor(): StorageAccessor | null {
  if (!isClient) return null;
  return {
    getLocal: (k) => {
      try {
        return window.localStorage.getItem(k);
      } catch {
        return null;
      }
    },
    setLocal: (k, v) => {
      try {
        window.localStorage.setItem(k, v);
      } catch {
        // Storage may be unavailable in privacy mode.
      }
    },
    getSession: (k) => {
      try {
        return window.sessionStorage.getItem(k);
      } catch {
        return null;
      }
    },
    setSession: (k, v) => {
      try {
        window.sessionStorage.setItem(k, v);
      } catch {
        // Storage may be unavailable in privacy mode.
      }
    },
  };
}

function createEventId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

interface PendingReportCall {
  key: string;
  ext: Record<string, unknown>;
  options: ReportOnceOrOptions | undefined;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

/** 默认 dedupeKey 内存防重 TTL：30 分钟（覆盖一次支付回跳风暴足够） */
const DEFAULT_DEDUPE_TTL = 30 * 60 * 1000;
const MAX_RETIRED_REPORT_POOLS = 4;

/**
 * 第三参数归一化：boolean → { onlyOnce } / undefined → {} / 对象原样返回
 */
function normalizeReportOptions(input: ReportOnceOrOptions | undefined): ReportOptions {
  if (input === undefined || input === null) return {};
  if (typeof input === 'boolean') return { onlyOnce: input };
  return input;
}

/**
 * 埋点上报核心类
 */
export class CoreTracker {
  initialized = false;
  initializing = false;
  protected requiresAliveBarrier = true;

  XH_ALIVE = 'xh_alive';
  XH_HEART = 'xh_heartbeat';
  XH_START = 'xh_start';

  xhMap: Record<string, string> = {
    [this.XH_ALIVE]: 'has_alive',
  };

  sLogIdUrl = '__log_id_url__';
  sLogIdParams = '__log_id_params__';

  moreGetter: () => Record<string, unknown> = noneFunc;
  reportFetch: ReportRequestFn = defaultReportFetch;
  attrFetch: ReportRequestFn = defaultReportFetch;

  isDev = false;
  allKeyMap: KeyValue[] = [];

  pkg = '';
  openId = '';
  versionName = '1.0.1';
  versionCode = makeVersionCode(this.versionName);

  reportUrl = '/adtrack';
  attrUrl = '/';
  sourceKeys = normalizeSourceKeys();

  private pendingReports: PendingReportCall[] = [];
  private pendingAttrReports: PendingReportCall[] = [];
  private reportPool: ReportEventPool | null = null;
  private readonly retiredReportPools = new Set<ReportEventPool>();
  private readonly retiredReportPoolIdentities = new Map<ReportEventPool, string>();
  private readonly retiredReportPoolTransports = new Map<
    ReportEventPool,
    { current: ReportRequestFn }
  >();
  private readonly dormantReportTransports = new Map<string, { current: ReportRequestFn }>();
  private readonly blockedRecoveryIdentities = new Set<string>();
  private reportTransportRef: { current: ReportRequestFn } | null = null;
  private reportIdentity = '';
  private lastEventCreatedAt = 0;

  /**
   * 按业务 id 的内存防重缓存：key = `${eventKey}::${dedupeKey}`, value = expireAt(ms timestamp)
   * 与 storage 维度的 onlyOnce 互补，解决当前页面内同一业务实体的重复调用。
   * 刷新会清零；支付跨刷新幂等由持久 orderId 标记和服务端业务主键保证。
   */
  private reportDedupeMap = new Map<string, number>();
  private attrDedupeMap = new Map<string, number>();
  private attrInFlight = new Set<string>();

  /** 已成功上报过同一 dedupeKey 时返回 true。排队中的重复由事件池拦截。 */
  private hasCommittedDedupe(
    map: Map<string, number>,
    eventKey: string,
    options: ReportOptions,
  ): boolean {
    if (!options.dedupeKey) return false;
    const cacheKey = `${eventKey}::${options.dedupeKey}`;
    const now = Date.now();
    const expireAt = map.get(cacheKey);
    if (expireAt && expireAt > now) return true;
    if (map.size > 256) {
      for (const [k, v] of map) {
        if (v <= now) map.delete(k);
      }
    }
    return false;
  }

  private commitDedupe(map: Map<string, number>, event: PooledReportEvent): void {
    if (!event.dedupeId || event.dedupeTtl === undefined) return;
    map.set(event.dedupeId, Date.now() + event.dedupeTtl);
  }

  constructor(config?: TrackerConfig) {
    if (config && config.pkg && !config.manual) {
      void this.init(config);
    } else if (config) {
      this.initParams(config);
    }

    this.initParams = this.initParams.bind(this);
    this.initKeys = this.initKeys.bind(this);
    this.appendAllKeyMap = this.appendAllKeyMap.bind(this);
    this.getReportParams = this.getReportParams.bind(this);
    this.getLogIdUrl = this.getLogIdUrl.bind(this);
    this.getLogIdParams = this.getLogIdParams.bind(this);
    this.saveMoreFunc = this.saveMoreFunc.bind(this);
    this.readMoreParams = this.readMoreParams.bind(this);
    this.doAttrReport = this.doAttrReport.bind(this);
    this._report = this._report.bind(this);
    this.doReport = this.doReport.bind(this);
    this.attrReport = this.attrReport.bind(this);
    this.init = this.init.bind(this);
  }

  setReportFetch(fn: ReportRequestFn): void {
    this.reportFetch = fn;
    if (this.reportTransportRef) this.reportTransportRef.current = fn;
  }

  setAttrFetch(fn: ReportRequestFn): void {
    this.attrFetch = fn;
  }

  private flushPendingQueues(): void {
    const reports = this.pendingReports.splice(0, this.pendingReports.length);
    for (const p of reports) {
      void this._report(p.key, p.ext, p.options).then(p.resolve).catch(p.reject);
    }
    const attrs = this.pendingAttrReports.splice(0, this.pendingAttrReports.length);
    for (const p of attrs) {
      void this.doAttrReport(p.key, p.ext, p.options).then(p.resolve).catch(p.reject);
    }
  }

  private getBrowserStorage(): Storage | null {
    if (!isClient) return null;
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }

  private createReportPool(
    identity: string,
    browserStorage: Storage | null,
    transportRef: { current: ReportRequestFn },
    poolDedupeMap: Map<string, number>,
  ): ReportEventPool {
    const pool = new ReportEventPool({
      barrierKey: this.requiresAliveBarrier ? this.XH_ALIVE : undefined,
      namespace: identity,
      storage: new ReportEventStorage(identity, browserStorage),
      send: (events, params) =>
        transportRef.current(events[0]?.url ?? this.reportUrl, {
          method: 'POST',
          params,
          body: events.map((event) => event.body),
        }),
      onIdle: () => {
        queueMicrotask(() => {
          if (pool === this.reportPool || pool.size > 0) return;
          const idleIdentity = this.retiredReportPoolIdentities.get(pool);
          pool.dispose();
          this.retiredReportPools.delete(pool);
          this.retiredReportPoolIdentities.delete(pool);
          this.retiredReportPoolTransports.delete(pool);
          if (idleIdentity) this.dormantReportTransports.delete(idleIdentity);
          this.recoverPersistedReportPools(browserStorage);
        });
      },
      onSettled: () => {
        queueMicrotask(() => {
          this.blockedRecoveryIdentities.delete(identity);
          if (new ReportEventStorage(identity, browserStorage).read().length === 0) {
            this.dormantReportTransports.delete(identity);
          }
          this.enforceRetiredPoolLimit();
          this.recoverPersistedReportPools(browserStorage);
        });
      },
      onSuccess: (events) => {
        const storage = getClientStorageAccessor();
        for (const event of events) {
          commitReportMarkers(event.commitMarkers, storage);
          this.commitDedupe(poolDedupeMap, event);
        }
      },
    });
    return pool;
  }

  private enforceRetiredPoolLimit(): void {
    while (this.retiredReportPools.size > MAX_RETIRED_REPORT_POOLS) {
      const pools = [...this.retiredReportPools];
      const candidate = pools.find((pool) => !pool.isFlushing) ?? pools[0];
      if (!candidate) return;
      const identity = this.retiredReportPoolIdentities.get(candidate);
      const transportRef = this.retiredReportPoolTransports.get(candidate);
      if (identity && transportRef) this.dormantReportTransports.set(identity, transportRef);
      if (identity && candidate.isFlushing) this.blockedRecoveryIdentities.add(identity);
      candidate.dispose(new Error('Retired report pool moved back to persistent recovery'));
      this.retiredReportPools.delete(candidate);
      this.retiredReportPoolIdentities.delete(candidate);
      this.retiredReportPoolTransports.delete(candidate);
    }
  }

  private recoverPersistedReportPools(browserStorage: Storage | null): void {
    if (this.isDev || !browserStorage || this.retiredReportPools.size >= MAX_RETIRED_REPORT_POOLS) {
      return;
    }
    const activeIdentities = new Set([
      this.reportIdentity,
      ...this.retiredReportPoolIdentities.values(),
      ...this.blockedRecoveryIdentities,
    ]);
    for (const identity of listReportEventNamespaces(browserStorage, this.pkg)) {
      if (
        activeIdentities.has(identity) ||
        this.retiredReportPools.size >= MAX_RETIRED_REPORT_POOLS
      ) {
        continue;
      }
      const transportRef = this.dormantReportTransports.get(identity) ?? {
        current: this.reportFetch,
      };
      const pool = this.createReportPool(
        identity,
        browserStorage,
        transportRef,
        new Map<string, number>(),
      );
      this.retiredReportPools.add(pool);
      this.retiredReportPoolIdentities.set(pool, identity);
      this.retiredReportPoolTransports.set(pool, transportRef);
      this.dormantReportTransports.delete(identity);
      activeIdentities.add(identity);
    }
  }

  private setupReportPool(): void {
    const nextIdentity = makeReportIdentity(this.pkg, this.openId);
    const browserStorage = this.getBrowserStorage();
    if (this.isDev) {
      this.reportPool?.dispose(new Error('Report pool disabled in development mode'));
      for (const pool of this.retiredReportPools) {
        pool.dispose(new Error('Report pool disabled in development mode'));
      }
      this.retiredReportPools.clear();
      this.retiredReportPoolIdentities.clear();
      this.retiredReportPoolTransports.clear();
      this.dormantReportTransports.clear();
      this.blockedRecoveryIdentities.clear();
      this.reportPool = null;
      this.reportTransportRef = null;
      this.reportDedupeMap = new Map<string, number>();
      this.attrDedupeMap = new Map<string, number>();
      this.attrInFlight = new Set<string>();
      this.reportIdentity = nextIdentity;
      return;
    }
    if (this.reportPool && this.reportIdentity === nextIdentity) {
      if (this.reportTransportRef) this.reportTransportRef.current = this.reportFetch;
      return;
    }

    const previousPool = this.reportPool;
    if (previousPool) {
      if (previousPool.size === 0) previousPool.dispose();
      else {
        this.retiredReportPools.add(previousPool);
        this.retiredReportPoolIdentities.set(previousPool, this.reportIdentity);
        if (this.reportTransportRef) {
          this.retiredReportPoolTransports.set(previousPool, this.reportTransportRef);
        }
      }
    }
    this.reportDedupeMap = new Map<string, number>();
    this.attrDedupeMap = new Map<string, number>();
    this.attrInFlight = new Set<string>();
    this.reportIdentity = nextIdentity;
    const poolDedupeMap = this.reportDedupeMap;

    const transportRef = { current: this.reportFetch };
    const pool = this.createReportPool(
      this.reportIdentity,
      browserStorage,
      transportRef,
      poolDedupeMap,
    );
    this.reportPool = pool;
    this.reportTransportRef = transportRef;
    this.enforceRetiredPoolLimit();
    this.recoverPersistedReportPools(browserStorage);
  }

  initParams(config: TrackerConfig): void {
    if (config.moreGetter) this.moreGetter = config.moreGetter;
    if (isDefined(config.isDev)) this.isDev = config.isDev;
    if (config.version) {
      this.versionName = config.version;
      this.versionCode = makeVersionCode(this.versionName);
    }
    if (config.pkg) this.pkg = config.pkg;
    if (config.reportUrl) this.reportUrl = config.reportUrl;
    if (config.attrUrl) this.attrUrl = config.attrUrl;
    if (config.reportFetch) this.reportFetch = config.reportFetch;
    if (config.attrFetch) this.attrFetch = config.attrFetch;
    if (config.sourceKeys) this.sourceKeys = normalizeSourceKeys(config.sourceKeys);

    this.openId = useToken(this.pkg, config.tk || '');
    this.allKeyMap = [];
    this.initKeys(config.keys);
  }

  initKeys(keys?: string[]): void {
    if (!keys || !keys.length) return;
    for (const xhKey of keys) {
      this.allKeyMap.push({
        key: xhKey.toUpperCase(),
        value: xhKey.toLowerCase(),
      });
    }
  }

  appendAllKeyMap(targetObj: Record<string, unknown>): void {
    for (const eachInfo of this.allKeyMap) {
      targetObj[eachInfo.key] = eachInfo.value;
    }
  }

  getReportParams(): ReportParams {
    const browserInfo = getBrowserInfo();

    return {
      channel: 'web',
      local: browserInfo.lang,
      appvn: this.versionName,
      plat: 'web',
      app: this.pkg,
      tk: this.openId,
      ts: Date.now(),
      manu: browserInfo.deviceName,
      sysv: browserInfo.osVersion || browserInfo.browserVersion,
      model: browserInfo.model,
      anid: this.openId,
      oaid: this.openId,
      w: browserInfo.deviceWidth,
      h: browserInfo.deviceHeight,
      sdkvn: SDK_VERSION,
    };
  }

  getLogIdUrl(): string {
    if (!isClient) return '';
    try {
      const newLogIdUrl = window.localStorage.getItem(this.sLogIdUrl);
      if (newLogIdUrl) return newLogIdUrl;

      window.localStorage.setItem(this.sLogIdUrl, window.location.href);
      const urlParams = getPageParams();
      window.localStorage.setItem(this.sLogIdParams, JSON.stringify(urlParams));
    } catch {
      return window.location.href;
    }
    return window.location.href;
  }

  getLogIdParams(): Record<string, unknown> {
    if (!isClient) return {};
    try {
      const raw = window.localStorage.getItem(this.sLogIdParams);
      if (!raw) return {};
      const parsed = safeParseJson(raw);
      return typeof parsed === 'object' && parsed !== null
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }

  saveMoreFunc(newFunc: () => Record<string, unknown>): void {
    if (typeof newFunc !== 'function') {
      this.moreGetter = noneFunc;
      return;
    }
    this.moreGetter = newFunc;
  }

  readMoreParams(): Record<string, unknown> {
    if (typeof this.moreGetter !== 'function') return {};
    const moreRecord = this.moreGetter();
    return typeof moreRecord === 'object' && moreRecord !== null ? moreRecord : {};
  }

  private ensureReady(): void {
    if (!this.openId) throw new Error('Tracker 还未初始化');
    if (!this.pkg) throw new Error('Tracker 初始化时 pkg 必传');
  }

  private sharedPreCheck(key: string): -2 | null {
    this.ensureReady();
    if (!key) return -2;
    return null;
  }

  private buildSourceExt(
    logIdParams: Record<string, unknown>,
    urlParams: Record<string, unknown>,
    ext: Record<string, unknown>,
  ): Record<string, unknown> {
    const normalizedExt = { ...ext };
    const extSource = normalizeSourceChannel(ext.source);
    const urlSource = resolveSourceFromParams({ ...logIdParams, ...urlParams }, this.sourceKeys);
    if (extSource) {
      normalizedExt.source = extSource;
    } else if (urlSource) {
      normalizedExt.source = urlSource;
    }
    return normalizedExt;
  }

  private getOrderId(ext: Record<string, unknown>): string | undefined {
    const orderId = ext.orderId;
    return typeof orderId === 'string' || typeof orderId === 'number' ? String(orderId) : undefined;
  }

  private createPooledReportEvent(
    key: string,
    ext: Record<string, unknown>,
    options: ReportOptions,
  ): PooledReportEvent {
    const params = this.getReportParams();
    const logIdParams = this.getLogIdParams();
    const urlParams = isClient ? getPageParams() : {};
    const moreParams = this.readMoreParams();
    const isHeartbeat = key === this.XH_HEART;
    const isStart = key === this.XH_START;
    const markerValue = isHeartbeat ? doDate(params.ts) : '1';
    const commitMarkers = buildReportCommitMarkers({
      identity: this.reportIdentity,
      isHeartbeat,
      isStart,
      key,
      onlyOnce: options.onlyOnce ?? false,
      orderId: this.getOrderId(ext),
      storageKey: resolveXhStorageKey(this.xhMap, key),
      value: markerValue,
    });
    const dedupeId = options.dedupeKey
      ? `${key}::${options.dedupeKey}`
      : commitMarkers[0]
        ? `marker::${commitMarkers[0].key}::${commitMarkers[0].value}`
        : undefined;

    this.lastEventCreatedAt = Math.max(Date.now(), this.lastEventCreatedAt + 1);
    return {
      id: createEventId(),
      body: {
        key,
        ext: buildMergedExtPayload(
          moreParams,
          logIdParams,
          urlParams,
          this.buildSourceExt(logIdParams, urlParams, ext),
          this.getLogIdUrl(),
        ),
        ts: params.ts,
      },
      commitMarkers,
      createdAt: this.lastEventCreatedAt,
      dedupeId,
      dedupeTtl: options.dedupeKey ? (options.dedupeTtl ?? DEFAULT_DEDUPE_TTL) : undefined,
      params: params as unknown as Record<string, unknown>,
      url: this.reportUrl,
    };
  }

  private ensureAliveBarrier(): void {
    if (!this.reportPool) return;
    const aliveEvent = this.createPooledReportEvent(this.XH_ALIVE, {}, { onlyOnce: true });
    const storage = getClientStorageAccessor();
    if (
      hasCommittedReportMarker(aliveEvent.commitMarkers, storage) ||
      (aliveEvent.dedupeId && this.reportPool.hasDedupeId(aliveEvent.dedupeId))
    ) {
      return;
    }
    void this.reportPool.enqueue(aliveEvent, true).catch((error) => {
      console.error('alive report failed', error);
    });
  }

  async doAttrReport(
    key: string,
    ext: Record<string, unknown> = {},
    onceOrOptions: ReportOnceOrOptions = false,
  ): Promise<unknown> {
    const opts = normalizeReportOptions(onceOrOptions);
    const onlyOnce = opts.onlyOnce ?? false;
    const attrDedupeMap = this.attrDedupeMap;
    const attrInFlight = this.attrInFlight;

    const pre = this.sharedPreCheck(key);
    if (pre !== null) return pre;

    if (shouldSkipAttrReportKey(key, this.XH_START, this.XH_HEART)) return -1;

    if (this.hasCommittedDedupe(attrDedupeMap, key, opts)) return -1;

    const params = this.getReportParams() as unknown as Record<string, unknown>;
    params.locale = params.local;
    params.appv = this.versionCode;
    params.brand = params.manu;
    params.token = params.tk;

    const logIdParams = this.getLogIdParams();
    const urlParams = isClient ? getPageParams() : {};
    const moreParams = this.readMoreParams();
    const storage = getClientStorageAccessor();
    const markers = buildReportCommitMarkers({
      identity: `${this.reportIdentity}:attr`,
      isHeartbeat: false,
      isStart: false,
      key,
      onlyOnce,
      orderId: this.getOrderId(ext),
      storageKey: resolveXhStorageKey(this.xhMap, key),
      value: '1',
    });
    if (hasCommittedReportMarker(markers, storage)) return -1;
    const inFlightKeys = [
      ...(opts.dedupeKey ? [`dedupe:${key}::${opts.dedupeKey}`] : []),
      ...markers.map((marker) => `marker:${marker.storage}:${marker.key}:${marker.value}`),
    ];
    if (inFlightKeys.some((inFlightKey) => attrInFlight.has(inFlightKey))) return -1;

    const mergedExt = buildMergedExtPayload(
      moreParams,
      logIdParams,
      urlParams,
      this.buildSourceExt(logIdParams, urlParams, ext),
      this.getLogIdUrl(),
    );

    const payload = [
      {
        eventId: key,
        attributes: mergedExt,
        ...params,
      },
    ];

    if (this.isDev) {
      // eslint-disable-next-line no-console
      console.log(`[Attr Report${onlyOnce ? ' onlyOnce' : ''}] ${key}`, payload);
      return -2;
    }

    for (const inFlightKey of inFlightKeys) attrInFlight.add(inFlightKey);
    try {
      const result = await this.attrFetch(this.attrUrl, { method: 'POST', body: payload });
      commitReportMarkers(markers, storage);
      if (opts.dedupeKey) {
        attrDedupeMap.set(
          `${key}::${opts.dedupeKey}`,
          Date.now() + (opts.dedupeTtl ?? DEFAULT_DEDUPE_TTL),
        );
      }
      return result;
    } finally {
      for (const inFlightKey of inFlightKeys) attrInFlight.delete(inFlightKey);
    }
  }

  async _report(
    key: string,
    ext: Record<string, unknown> = {},
    onceOrOptions: ReportOnceOrOptions = false,
  ): Promise<unknown> {
    const opts = normalizeReportOptions(onceOrOptions);
    const onlyOnce = opts.onlyOnce ?? false;

    const pre = this.sharedPreCheck(key);
    if (pre !== null) return pre;

    if (this.hasCommittedDedupe(this.reportDedupeMap, key, opts)) return -1;
    if (this.isDev) {
      const event = this.createPooledReportEvent(key, ext, opts);
      // eslint-disable-next-line no-console
      console.log(`[Xh Report${onlyOnce ? ' onlyOnce' : ''}] ${key}`, event.params, [event.body]);
      return -2;
    }

    if (!this.reportPool) this.setupReportPool();
    if (this.requiresAliveBarrier && key !== this.XH_ALIVE) this.ensureAliveBarrier();
    const event = this.createPooledReportEvent(key, ext, opts);
    const storage = getClientStorageAccessor();
    if (hasCommittedReportMarker(event.commitMarkers, storage)) return -1;

    return this.reportPool?.enqueue(event) ?? -1;
  }

  doReport(
    key: string,
    ext?: Record<string, unknown>,
    onceOrOptions?: ReportOnceOrOptions,
  ): Promise<unknown> {
    if (this.initialized) return this._report(key, ext ?? {}, onceOrOptions);
    return new Promise((resolve, reject) => {
      this.pendingReports.push({
        key,
        ext: ext ?? {},
        options: onceOrOptions,
        resolve,
        reject,
      });
    });
  }

  attrReport(
    key: string,
    ext?: Record<string, unknown>,
    onceOrOptions?: ReportOnceOrOptions,
  ): Promise<unknown> {
    if (this.initialized) return this.doAttrReport(key, ext ?? {}, onceOrOptions);
    return new Promise((resolve, reject) => {
      this.pendingAttrReports.push({
        key,
        ext: ext ?? {},
        options: onceOrOptions,
        resolve,
        reject,
      });
    });
  }

  /**
   * 初始化后自动上报事件，子类可覆写以改变行为
   */
  protected async afterInit(): Promise<void> {
    if (!isClient) return;
    void this.doReport(this.XH_ALIVE, {}, true).catch((error) => {
      console.error('alive report failed', error);
    });
    void Promise.all([
      this.doReport(this.XH_HEART, {}, true),
      this.doReport(this.XH_START, {}),
    ]).catch((error) => {
      console.error('heartbeat/start report failed', error);
    });
  }

  async init(config: TrackerConfig = {} as TrackerConfig): Promise<void> {
    if (this.initializing) return;
    this.initializing = true;
    this.initialized = false;
    try {
      this.initParams(config);
      this.setupReportPool();
      this.initialized = true;
      await this.afterInit();
      this.flushPendingQueues();
      void this.reportPool?.flush(false).catch(() => {
        // Each caller receives its own rejection; the pool persists and retries the batch.
      });
    } catch (err) {
      console.error('init failed', err);
      this.initialized = false;
    } finally {
      this.initializing = false;
    }
  }
}

export default CoreTracker;
