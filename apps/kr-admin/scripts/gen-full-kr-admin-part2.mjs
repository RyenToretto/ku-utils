/**
 * Part 2: App, main, example module routes + functional pages
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src');
function write(rel, content) {
  const full = path.join(SRC, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log(rel);
}

write(
  'App.tsx',
  `import { ConfigProvider, theme as antTheme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { useVersionUpdate } from '@ku-utils/hooks-react';
import BaseHeader from '@/layouts/BaseHeader';
import { useSplashReadiness } from '@/composables/useSplashReadiness';
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
    getVersionId: (v) => \`\${v.version}:\${(v as { versionTimeISO?: string }).versionTimeISO || ''}\`,
    getVersionTime: (v) =>
      \`\${v.version}:\${(v as { versionTime?: string }).versionTime || ''}\`,
  });

  const hideHeader = Boolean((location.state as { hideHeader?: boolean })?.hideHeader) ||
    location.pathname === '/account-exception' ||
    location.pathname === '/logged-out';

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: 'var(--ku-color-primary, #9a6328)',
          borderRadius: 6,
        },
      }}
    >
      <div className="app-entry" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--ku-bg-page-gradient, var(--ku-bg-page))' }}>
        {!hideHeader ? (
          <BaseHeader hasUpdate={hasUpdate} onRefresh={refreshForUpdate} />
        ) : null}
        <div className="app-shell-main" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <Outlet />
        </div>
      </div>
    </ConfigProvider>
  );
}
`,
);

write(
  'main.tsx',
  `import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'antd/dist/reset.css';
import '@ku-utils/skin';
import '@ku-utils/r-custom-columns/style';
import '@/assets/styles/antd-ku-bridge.scss';
import '@/assets/styles/index.scss';
import '@/plugins/axios';

import { mountAndDismissSplash, mountAppWithSplashHandoff } from '@/bootstrap/mountAppWithSplashHandoff';
import { MODULE_PERMISSION_KEYS } from '@/maps/common/dspPermission';
import { createAppRouter } from '@/router';
import { useAppStore } from '@/stores/app';
import { useUserStore } from '@/stores/user';
import {
  consumeLogoutNext,
  consumePostLoginReturnPath,
  isUnauthorizedBusinessCode,
  isUserInfoMissingLocalUserCode,
  redirectToLogin,
} from '@/utils/authRedirect';
import {
  ACCOUNT_EXCEPTION_PATH,
  LOGGED_OUT_PATH,
  isAuthStatusDebugPreviewAtBoot,
  isAuthStatusPath,
} from '@/utils/authStatus';
import { applyInitialTheme } from '@/utils/theme';
import App from '@/App';
import ErrorPage from '@/views/ErrorPage';

dayjs.locale('zh-cn');
applyInitialTheme('admin');
useAppStore.getState().applyTheme();

function extractErrorCode(err: unknown): string | number | null {
  if (!err || typeof err !== 'object') return null;
  const anyErr = err as { code?: number | string; response?: { data?: { code?: number | string } } };
  if (anyErr.code != null && anyErr.code !== '') return anyErr.code;
  const bodyCode = anyErr.response?.data?.code;
  if (bodyCode != null && bodyCode !== '') return bodyCode;
  return null;
}

function isUnauthorizedError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const anyErr = err as {
    message?: string;
    response?: { status?: number; data?: { code?: number | string } };
    code?: number | string;
  };
  if (anyErr.message === 'unauthorized') return true;
  if (anyErr.response?.status === 401) {
    const bodyCode = anyErr.response?.data?.code;
    if (isUserInfoMissingLocalUserCode(bodyCode) || isUserInfoMissingLocalUserCode(anyErr.code)) return false;
    return true;
  }
  return isUnauthorizedBusinessCode(anyErr.code);
}

function isUserNotProvisionedError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const anyErr = err as { message?: string; code?: number | string; response?: { data?: { code?: number | string } } };
  if (anyErr.message === 'user-not-provisioned') return true;
  if (isUserInfoMissingLocalUserCode(anyErr.code)) return true;
  return isUserInfoMissingLocalUserCode(anyErr.response?.data?.code);
}

function hasAnyModulePermission() {
  const user = useUserStore.getState();
  return MODULE_PERMISSION_KEYS.some((key) => user.hasPermission(key));
}

function renderAt(path?: string) {
  if (path && window.location.pathname !== path) {
    window.history.replaceState(window.history.state, '', path);
  }
  const router = createAppRouter();
  mountAppWithSplashHandoff(() => {
    ReactDOM.createRoot(document.getElementById('app')!).render(
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>,
    );
  });
}

async function bootstrap() {
  if (isAuthStatusDebugPreviewAtBoot()) {
    renderAt();
    return;
  }

  const userStore = useUserStore.getState();
  try {
    try {
      await userStore.fetchUserInfo();
    } catch (firstErr) {
      if (isUnauthorizedError(firstErr) || isUserNotProvisionedError(firstErr)) throw firstErr;
      await new Promise((r) => setTimeout(r, 400));
      await userStore.fetchUserInfo();
    }

    if (!hasAnyModulePermission()) {
      useUserStore.getState().markNoPermissionDenied();
      renderAt(ACCOUNT_EXCEPTION_PATH);
      return;
    }

    const postLoginReturn = consumePostLoginReturnPath();
    if (postLoginReturn && !isAuthStatusPath(postLoginReturn) && postLoginReturn !== window.location.pathname) {
      window.history.replaceState(window.history.state, '', postLoginReturn);
    }
    renderAt();
  } catch (err) {
    console.error(err);
    if (isUnauthorizedError(err)) {
      const logoutNext = consumeLogoutNext();
      if (logoutNext === 'logged-out') {
        renderAt(LOGGED_OUT_PATH);
        return;
      }
      if (logoutNext === 'login') {
        redirectToLogin();
        return;
      }
      return;
    }
    if (isUserNotProvisionedError(err)) {
      useUserStore.getState().markAccessDeniedFromError(err);
      renderAt(ACCOUNT_EXCEPTION_PATH);
      return;
    }
    await mountAndDismissSplash(() => {
      ReactDOM.createRoot(document.getElementById('app')!).render(
        <React.StrictMode>
          <ErrorPage code={extractErrorCode(err)} />
        </React.StrictMode>,
      );
    });
  }
}

void bootstrap();
`,
);

write(
  'router/index.tsx',
  `import { createBrowserRouter, Navigate } from 'react-router-dom';
import exampleRoutes from '@example-routes';
import App from '@/App';
import AccountException from '@/views/AccountException';
import ErrorPage from '@/views/ErrorPage';
import LoggedOut from '@/views/LoggedOut';
import { ACCOUNT_EXCEPTION_PATH, LOGGED_OUT_PATH } from '@/utils/authStatus';

export function createAppRouter() {
  return createBrowserRouter([
    {
      path: '/',
      element: <App />,
      children: [
        { index: true, element: <Navigate to="/example" replace /> },
        { path: ACCOUNT_EXCEPTION_PATH.replace(/^\\//, ''), element: <AccountException /> },
        { path: LOGGED_OUT_PATH.replace(/^\\//, ''), element: <LoggedOut /> },
        { path: 'no-permission', element: <Navigate to={ACCOUNT_EXCEPTION_PATH} replace /> },
        ...(Array.isArray(exampleRoutes) ? exampleRoutes : []),
        { path: '*', element: <ErrorPage /> },
      ],
    },
  ]);
}
`,
);

// Generic demo page helper
const pageShell = (title, body) => `import { Card } from 'antd';

export default function Page() {
  return (
    <div className="page-demo" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Card size="small" title={${JSON.stringify(title)}}>
        ${body}
      </Card>
    </div>
  );
}
`;

// Simple list page (reusable pattern)
write(
  'modules/_example/simpleExample/_module/SimpleExampleList.tsx',
  `import { Button, Form, Input, Radio, Space, message } from 'antd';
import { useMemo, useState } from 'react';
import DoFilterPanel from '@/components/DoFilterPanel';
import TableWrap from '@/components/TableWrap';
import { useTableQuery } from '@/composables/useTableQuery';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { requestSimpleExampleList, requestDeleteSimpleExample } from '../_api/simpleExample';
import DialogEditSimpleExample from './DialogEditSimpleExample';

type Row = Record<string, unknown> & { id: string | number; exampleName?: string };

export default function SimpleExampleList({
  fillViewportLayout = true,
  filterLine,
  demoFields,
}: {
  fillViewportLayout?: boolean;
  filterLine?: number;
  demoFields?: Array<{ key: string; kind: 'input' | 'select' | 'radio' }>;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<Row | null>(null);
  const maxHeight = useAdminTableMaxHeight();

  const {
    listFilters,
    setFilters,
    tableData,
    tableTotal,
    tableLoading,
    pageNum,
    pageSize,
    search,
    onPageChange,
  } = useTableQuery<Row, { exampleName: string; taskAction: string; status: string }>({
    defaultFilters: { exampleName: '', taskAction: '', status: '' },
    fetcher: async (query, signal) => requestSimpleExampleList(query, { signal }) as Promise<{ data: { lists: Row[]; total: number } }>,
  });

  const columns = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id', width: 80 },
      { title: '示例名称', dataIndex: 'exampleName', ellipsis: true },
      { title: '任务类型', dataIndex: 'taskAction', width: 120 },
      { title: '状态', dataIndex: 'status', width: 100 },
      {
        title: '操作',
        key: 'op',
        width: 160,
        render: (_: unknown, row: Row) => (
          <Space>
            <Button type="link" size="small" onClick={() => { setEditRow(row); setEditOpen(true); }}>编辑</Button>
            <Button
              type="link"
              size="small"
              danger
              onClick={async () => {
                await requestDeleteSimpleExample({ id: row.id });
                message.success('已删除');
                void search(false);
              }}
            >
              删除
            </Button>
          </Space>
        ),
      },
    ],
    [search],
  );

  return (
    <div className="page-simple-example-list" style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: fillViewportLayout ? 1 : undefined, minHeight: 0 }}>
      <DoFilterPanel loading={tableLoading} line={filterLine} onSearch={() => void search(true)}>
        <Form layout="inline" onFinish={() => void search(true)}>
          {demoFields?.length ? (
            demoFields.map((field) => (
              <Form.Item key={field.key} label={\`筛选项 \${field.key.slice(1)}\`}>
                {field.kind === 'input' ? (
                  <Input
                    allowClear
                    placeholder="不限"
                    onChange={(e) => setFilters((f) => ({ ...f, [field.key]: e.target.value } as typeof f))}
                  />
                ) : (
                  <Radio.Group
                    defaultValue=""
                    onChange={(e) => setFilters((f) => ({ ...f, [field.key]: e.target.value } as typeof f))}
                    optionType="button"
                    options={[
                      { label: '不限', value: '' },
                      { label: '启用', value: '1' },
                      { label: '停用', value: '0' },
                    ]}
                  />
                )}
              </Form.Item>
            ))
          ) : (
            <>
              <Form.Item label="示例名称">
                <Input
                  allowClear
                  placeholder="不限"
                  value={listFilters.exampleName}
                  onChange={(e) => setFilters((f) => ({ ...f, exampleName: e.target.value }))}
                  onPressEnter={() => void search(true)}
                />
              </Form.Item>
              <Form.Item label="状态">
                <Radio.Group
                  value={listFilters.status}
                  optionType="button"
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, status: e.target.value }));
                    void search(true);
                  }}
                  options={[
                    { label: '不限', value: '' },
                    { label: '启用', value: '1' },
                    { label: '停用', value: '0' },
                  ]}
                />
              </Form.Item>
            </>
          )}
        </Form>
      </DoFilterPanel>
      <div>
        <Button type="primary" onClick={() => { setEditRow(null); setEditOpen(true); }}>新建示例</Button>
      </div>
      <TableWrap
        rowKey="id"
        loading={tableLoading}
        columns={columns}
        dataSource={tableData}
        maxHeight={maxHeight}
        pagination={{
          current: pageNum,
          pageSize,
          total: tableTotal,
          onChange: onPageChange,
        }}
      />
      <DialogEditSimpleExample
        open={editOpen}
        row={editRow}
        onClose={() => setEditOpen(false)}
        onSaved={() => { setEditOpen(false); void search(true); }}
      />
    </div>
  );
}
`,
);

write(
  'modules/_example/simpleExample/_module/DialogEditSimpleExample.tsx',
  `import { Form, Input, Modal, message } from 'antd';
import { useEffect } from 'react';
import { requestSaveSimpleExample } from '../_api/simpleExample';

export default function DialogEditSimpleExample({
  open,
  row,
  onClose,
  onSaved,
}: {
  open: boolean;
  row: Record<string, unknown> | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form] = Form.useForm();
  useEffect(() => {
    if (open) form.setFieldsValue(row || { exampleName: '' });
  }, [open, row, form]);

  return (
    <Modal
      title={row ? '编辑示例' : '新建示例'}
      open={open}
      onCancel={onClose}
      onOk={async () => {
        const values = await form.validateFields();
        await requestSaveSimpleExample({ ...row, ...values });
        message.success('保存成功');
        onSaved();
      }}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="exampleName" label="示例名称" rules={[{ required: true, message: '请输入示例名称' }]}>
          <Input placeholder="请输入" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
`,
);

console.log('part2 core done');
