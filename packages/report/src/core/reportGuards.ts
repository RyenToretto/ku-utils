import type { ReportCommitMarker } from './reportEventPool';

function hashIdentity(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

export function makeReportIdentity(pkg: string, token: string): string {
  return hashIdentity(`${pkg}\u0000${token}`);
}

export function buildReportCommitMarkers(options: {
  identity: string;
  isHeartbeat: boolean;
  isStart: boolean;
  key: string;
  onlyOnce: boolean;
  orderId: string | undefined;
  storageKey: string;
  value: string;
}): ReportCommitMarker[] {
  const { identity, isHeartbeat, isStart, key, onlyOnce, orderId, storageKey, value } = options;
  const prefix = `__ku_utils_report__:${identity}`;
  const markers: ReportCommitMarker[] = [];

  if (key === 'xh_alive') {
    markers.push({ key: `${prefix}:lifecycle:${storageKey}`, storage: 'local', value: '1' });
  } else if (isHeartbeat) {
    markers.push({ key: `${prefix}:lifecycle:${storageKey}`, storage: 'local', value });
  } else if (isStart) {
    markers.push({ key: `${prefix}:lifecycle:${storageKey}`, storage: 'session', value: '1' });
  } else if (onlyOnce) {
    markers.push({ key: `${prefix}:event:${storageKey}`, storage: 'local', value: '1' });
  }

  if (key === 'pay_suc' && orderId) {
    markers.push({ key: `${prefix}:pay:${orderId}`, storage: 'local', value: '1' });
  }

  return markers;
}

export function hasCommittedReportMarker(
  markers: ReportCommitMarker[],
  storage: StorageAccessor | null,
): boolean {
  if (!storage) return false;
  return markers.some((marker) => {
    const stored =
      marker.storage === 'local' ? storage.getLocal(marker.key) : storage.getSession(marker.key);
    return stored === marker.value;
  });
}

export function commitReportMarkers(
  markers: ReportCommitMarker[],
  storage: StorageAccessor | null,
): void {
  if (!storage) return;
  for (const marker of markers) {
    if (marker.storage === 'local') storage.setLocal(marker.key, marker.value);
    else storage.setSession(marker.key, marker.value);
  }
}

export function resolveXhStorageKey(xhMap: Record<string, string>, key: string): string {
  return xhMap[key] ?? key;
}

export function checkPayDuplicate(
  key: string,
  ext: Record<string, unknown> | undefined,
  getLocalStorage: () => Storage | null,
): boolean {
  if (key !== 'pay_suc' || !ext?.orderId) return false;
  const storage = getLocalStorage();
  if (!storage) return false;
  const storageKey = `__paid_${ext.orderId as string}`;
  const cached = storage.getItem(storageKey);
  if (cached && +cached === 1) return true;
  storage.setItem(storageKey, '1');
  return false;
}

/** 属性上报：xh_start / xh_heartbeat 直接跳过 */
export function shouldSkipAttrReportKey(key: string, xhStart: string, xhHeart: string): boolean {
  return key === xhStart || key === xhHeart;
}

export interface StorageAccessor {
  getLocal: (k: string) => string | null;
  setLocal: (k: string, v: string) => void;
  getSession: (k: string) => string | null;
  setSession: (k: string, v: string) => void;
}

function commitNormalReportMarkers(
  opts: {
    isHeartbeat: boolean;
    isStart: boolean;
    xhKey: string;
    nowDate: string;
  },
  s: StorageAccessor,
): void {
  const { isHeartbeat, isStart, xhKey, nowDate } = opts;
  if (isHeartbeat) {
    s.setLocal(xhKey, nowDate);
  } else if (isStart) {
    s.setSession(xhKey, '1');
  } else {
    s.setLocal(xhKey, '1');
  }
}

/**
 * 普通上报：客户端存储门控 + 写入标记；非客户端直接通过。
 * @returns true 表示应跳过上报（返回 -1）
 */
export function normalReportStoragePhase(
  opts: {
    onlyOnce: boolean;
    isHeartbeat: boolean;
    isStart: boolean;
    xhKey: string;
    nowDate: string;
  },
  s: StorageAccessor | null,
): boolean {
  if (!s) return false;

  const { onlyOnce, isHeartbeat, isStart, xhKey, nowDate } = opts;

  if (onlyOnce) {
    const sValue = s.getLocal(xhKey);
    if (sValue && +sValue === 1) return true;
    if (isHeartbeat && sValue === nowDate) return true;
  }

  if (isStart) {
    const sValue = s.getSession(xhKey);
    if (sValue && +sValue === 1) return true;
  }

  commitNormalReportMarkers({ isHeartbeat, isStart, xhKey, nowDate }, s);
  return false;
}

/**
 * 属性上报：onlyOnce + 客户端时检查；通过后（或非客户端）在客户端写入 xhKey=1
 * @returns true 表示应跳过上报（返回 -1）
 */
export function attrReportStoragePhase(
  xhKey: string,
  onlyOnce: boolean,
  s: StorageAccessor | null,
): boolean {
  if (!s) return false;

  if (onlyOnce) {
    const sValue = s.getLocal(xhKey);
    if (sValue && +sValue === 1) return true;
  }

  s.setLocal(xhKey, '1');
  return false;
}
