import { describe, expect, it } from 'vitest';

import {
  buildReportCommitMarkers,
  commitReportMarkers,
  hasCommittedReportMarker,
  makeReportIdentity,
  type StorageAccessor,
} from './reportGuards';

function createStorageAccessor(): StorageAccessor & {
  local: Map<string, string>;
  session: Map<string, string>;
} {
  const local = new Map<string, string>();
  const session = new Map<string, string>();
  return {
    getLocal: (key) => local.get(key) ?? null,
    getSession: (key) => session.get(key) ?? null,
    local,
    session,
    setLocal: (key, value) => local.set(key, value),
    setSession: (key, value) => session.set(key, value),
  };
}

describe('transactional report markers', () => {
  it('isolates marker namespaces by app and token', () => {
    expect(makeReportIdentity('app', 'token-1')).not.toBe(makeReportIdentity('app', 'token-2'));
    expect(makeReportIdentity('app-1', 'token')).not.toBe(makeReportIdentity('app-2', 'token'));
  });

  it('does not write alive markers until the successful batch commits', () => {
    const storage = createStorageAccessor();
    const markers = buildReportCommitMarkers({
      identity: makeReportIdentity('app', 'token'),
      isHeartbeat: false,
      isStart: false,
      key: 'xh_alive',
      onlyOnce: true,
      orderId: undefined,
      storageKey: 'xh_alive',
      value: '1',
    });

    expect(hasCommittedReportMarker(markers, storage)).toBe(false);
    expect(storage.local.size).toBe(0);

    commitReportMarkers(markers, storage);

    expect(hasCommittedReportMarker(markers, storage)).toBe(true);
  });

  it('commits payment order markers only after success', () => {
    const storage = createStorageAccessor();
    const markers = buildReportCommitMarkers({
      identity: makeReportIdentity('app', 'token'),
      isHeartbeat: false,
      isStart: false,
      key: 'pay_suc',
      onlyOnce: false,
      orderId: 'order-1',
      storageKey: 'pay_suc',
      value: '1',
    });

    expect(hasCommittedReportMarker(markers, storage)).toBe(false);
    commitReportMarkers(markers, storage);
    expect(hasCommittedReportMarker(markers, storage)).toBe(true);
  });

  it('keeps custom xhMap storage keys in the scoped marker', () => {
    const markers = buildReportCommitMarkers({
      identity: makeReportIdentity('app', 'token'),
      isHeartbeat: false,
      isStart: false,
      key: 'first_install',
      onlyOnce: true,
      orderId: undefined,
      storageKey: 'custom_install_marker',
      value: '1',
    });

    expect(markers[0]?.key).toContain('custom_install_marker');
  });
});
