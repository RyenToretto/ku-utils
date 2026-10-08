import { useVersionUpdate } from '@ku-utils/hooks-react';
import { App as AntdApp, ConfigProvider, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import DialogPreviewVideo, { type DialogPreviewVideoRef } from '@/components/DialogPreviewVideo';
import { useSplashReadiness } from '@/composables/useSplashReadiness';
import BaseHeader from '@/layouts/BaseHeader';
import { AntdAppBridge } from '@/plugins/antdApp';
import { createAntdTheme } from '@/plugins/antdTheme';
import { useAppStore } from '@/stores/app';
import { registerPreviewVideoHost } from '@/utils/previewMedia';
import { fetchStaticVersion } from '@/utils/version';

export default function App() {
  const location = useLocation();
  const previewVideoRef = useRef<DialogPreviewVideoRef>(null);
  const [routerReady, setRouterReady] = useState(false);
  const themeMode = useAppStore((s) => s.theme);
  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const antdTheme = useMemo(() => createAntdTheme(isDark), [isDark]);

  useEffect(() => {
    setRouterReady(true);
  }, [location.pathname]);

  useSplashReadiness(routerReady);

  useLayoutEffect(() => {
    const host = previewVideoRef.current;
    registerPreviewVideoHost(host ? { play: (url, raw) => host.play(url, raw) } : null);
    return () => registerPreviewVideoHost(null);
  }, []);

  const { hasUpdate, refreshForUpdate } = useVersionUpdate({
    fetchVersion: fetchStaticVersion,
    getVersionId: (v) => `${v.version}:${v.versionTimeISO}`,
    getVersionTime: (v) => `${v.version}:${v.versionTime}`,
  });

  const hideHeader =
    location.pathname === '/account-exception' || location.pathname === '/logged-out';

  return (
    <ConfigProvider
      locale={zhCN}
      button={{ autoInsertSpace: false }}
      theme={antdTheme}
    >
      <AntdApp component={false}>
        <AntdAppBridge />
        <div
          className="app-entry"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            background: 'var(--ku-bg-page-gradient, var(--ku-bg-page))',
          }}
        >
          {!hideHeader ? (
            <BaseHeader
              hasUpdate={hasUpdate}
              onRefresh={refreshForUpdate}
            />
          ) : null}
          <div
            className="app-shell-main"
            style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
          >
            <Suspense
              fallback={
                <div style={{ padding: 48, textAlign: 'center' }}>
                  <Spin />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
          <DialogPreviewVideo ref={previewVideoRef} />
        </div>
      </AntdApp>
    </ConfigProvider>
  );
}
