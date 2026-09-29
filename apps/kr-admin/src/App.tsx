import { useVersionUpdate } from '@ku-utils/hooks-react';
import { ConfigProvider, theme as antTheme, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useSplashReadiness } from '@/composables/useSplashReadiness';
import BaseHeader from '@/layouts/BaseHeader';
import { useAppStore } from '@/stores/app';
import { fetchStaticVersion } from '@/utils/version';

export default function App() {
  const location = useLocation();
  const [routerReady, setRouterReady] = useState(false);
  const themeMode = useAppStore((s) => s.theme);
  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    setRouterReady(true);
  }, [location.pathname]);

  useSplashReadiness(routerReady);

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
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#9a6328',
          borderRadius: 6,
        },
      }}
    >
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
      </div>
    </ConfigProvider>
  );
}
