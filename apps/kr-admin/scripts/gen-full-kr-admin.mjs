/**
 * Full kr-admin React app generator — shell + 37 example leaves.
 * node apps/kr-admin/scripts/gen-full-kr-admin.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '../src');
const ROOT = path.resolve(__dirname, '..');

function write(rel, content) {
  const full = path.join(SRC, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

function writeRoot(rel, content) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

// ——— index.html ———
const kv3Html = fs.readFileSync(path.join(ROOT, '../kv3-admin/index.html'), 'utf8');
writeRoot(
  'index.html',
  kv3Html
    .replace(/kv3-admin/g, 'kr-admin')
    .replace('/src/main.ts', '/src/main.tsx')
    .replace('data-app="admin"', 'data-app="admin" data-stack="react"'),
);

// ——— composables ———
write(
  'composables/useSplashReadiness.ts',
  `import { useEffect } from 'react';
import { dismissInlineAppSplash } from '@/bootstrap/removeInlineAppSplash';
import { closeSplashGate } from '@/bootstrap/splashGate';

export function useSplashReadiness(ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    void (async () => {
      await dismissInlineAppSplash();
      closeSplashGate();
    })();
  }, [ready]);
}
`,
);

write(
  'composables/useAdminTableMaxHeight.ts',
  `import { useMaxHeight } from '@ku-utils/hooks-react';

export function useAdminTableMaxHeight(options?: {
  containSelector?: string;
  targetSelector?: string;
  footerSelector?: string;
  defaultHeight?: number;
  minHeight?: number;
}) {
  const {
    containSelector = '.domain-module-main',
    targetSelector = '.table-wrap .ant-table',
    footerSelector = '.main-footer',
    defaultHeight = 200,
    minHeight = 332,
  } = options || {};
  return useMaxHeight(containSelector, targetSelector, defaultHeight, {
    footerSelector,
    minHeight,
  });
}
`,
);

write(
  'composables/useTableQuery.ts',
  `import { useCallback, useEffect, useRef, useState } from 'react';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 500;

export type TableQueryFetchContext = { silent: boolean };

export type UseTableQueryOptions<TRow extends Record<string, unknown>, TFilter extends Record<string, unknown>> = {
  defaultFilters: TFilter;
  fetcher: (
    query: Record<string, unknown>,
    signal: AbortSignal,
    ctx: TableQueryFetchContext,
  ) => Promise<{ data?: { lists?: TRow[]; total?: number } } | { lists?: TRow[]; total?: number }>;
  enablePagination?: boolean;
  defaultPageSize?: number;
  immediate?: boolean;
  transformQuery?: (query: Record<string, unknown>) => Record<string, unknown>;
};

export function useTableQuery<TRow extends Record<string, unknown>, TFilter extends Record<string, unknown>>(
  options: UseTableQueryOptions<TRow, TFilter>,
) {
  const {
    defaultFilters,
    fetcher,
    enablePagination = true,
    defaultPageSize = DEFAULT_PAGE_SIZE,
    immediate = true,
    transformQuery,
  } = options;

  const [filters, setFilters] = useState({ ...defaultFilters });
  const [tableData, setTableData] = useState<TRow[]>([]);
  const [tableTotal, setTableTotal] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(
    async (resetPage = true, silent = false) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      const nextPage = resetPage ? 1 : pageNum;
      if (resetPage) setPageNum(1);
      if (!silent) setTableLoading(true);
      try {
        let query: Record<string, unknown> = { ...filters };
        if (enablePagination) {
          query.pageNum = nextPage;
          query.pageSize = pageSize;
        }
        if (transformQuery) query = transformQuery(query);
        const res = await fetcher(query, ac.signal, { silent });
        const data = (res as { data?: { lists?: TRow[]; total?: number } }).data ?? (res as { lists?: TRow[]; total?: number });
        setTableData(Array.isArray(data?.lists) ? data.lists : []);
        setTableTotal(Number(data?.total) || 0);
      } catch (err) {
        if ((err as { name?: string })?.name === 'CanceledError' || (err as { code?: string })?.code === 'ERR_CANCELED') return;
        if (!silent) throw err;
      } finally {
        if (!silent) setTableLoading(false);
      }
    },
    [filters, pageNum, pageSize, enablePagination, fetcher, transformQuery],
  );

  useEffect(() => {
    if (immediate) void search(true);
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    filters,
    setFilters,
    listFilters: filters,
    tableData,
    tableTotal,
    tableLoading,
    pageNum,
    pageSize,
    setPageNum,
    setPageSize,
    search,
    onPageChange(page: number, size: number) {
      setPageNum(page);
      setPageSize(size);
      void search(false);
    },
  };
}
`,
);

// ——— layouts ———
write(
  'layouts/DomainModuleShell.tsx',
  `import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import SideMenu, { type SideMenuNode } from './sideMenu';

const { Sider, Content } = Layout;

export default function DomainModuleShell({
  menus,
  moduleRootPath,
}: {
  menus: SideMenuNode[];
  moduleRootPath: string;
}) {
  return (
    <Layout className="domain-module-shell" style={{ height: '100%', background: 'transparent' }}>
      <Sider width={220} theme="light" className="domain-module-sider" style={{ background: 'var(--ku-bg-elevated, #fff)' }}>
        <SideMenu menus={menus} moduleRootPath={moduleRootPath} />
      </Sider>
      <Content className="domain-module-main" style={{ padding: 20, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
`,
);

write(
  'layouts/sideMenu/index.tsx',
  `import { Menu } from 'antd';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type SideMenuNode = {
  path: string;
  title: string;
  icon?: React.ReactNode;
  children?: Array<string | SideMenuNode>;
};

function resolveTitle(path: string, routeTitles: Record<string, string>) {
  return routeTitles[path] || path.split('/').pop() || path;
}

export default function SideMenu({
  menus,
  moduleRootPath: _moduleRootPath,
}: {
  menus: SideMenuNode[];
  moduleRootPath: string;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const routeTitles = useMemo(() => {
    const map: Record<string, string> = {};
    const walk = (nodes: SideMenuNode[]) => {
      nodes.forEach((n) => {
        map[n.path] = n.title;
        (n.children || []).forEach((c) => {
          if (typeof c === 'string') return;
          walk([c]);
        });
      });
    };
    walk(menus);
    return map;
  }, [menus]);

  const items = useMemo(() => {
    return menus.map((group) => ({
      key: group.path,
      icon: group.icon,
      label: group.title,
      children: (group.children || []).map((child) => {
        if (typeof child === 'string') {
          return { key: child, label: resolveTitle(child, routeTitles) };
        }
        return {
          key: child.path,
          label: child.title,
          children: (child.children || []).map((leaf) => {
            if (typeof leaf === 'string') {
              return { key: leaf, label: resolveTitle(leaf, routeTitles) };
            }
            return { key: leaf.path, label: leaf.title };
          }),
        };
      }),
    }));
  }, [menus, routeTitles]);

  const selected = location.pathname;

  return (
    <Menu
      mode="inline"
      selectedKeys={[selected]}
      defaultOpenKeys={menus.map((m) => m.path)}
      items={items}
      onClick={({ key }) => navigate(String(key))}
      style={{ height: '100%', borderInlineEnd: 0 }}
    />
  );
}
`,
);

write(
  'layouts/BaseHeader.tsx',
  `import { MoonOutlined, SunOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Space, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/stores/app';
import { useUserStore } from '@/stores/user';
import { submitLogout } from '@/plugins/axios';
import HeaderExampleTab from '@header-example-tab';

export default function BaseHeader({
  hasUpdate,
  onRefresh,
}: {
  hasUpdate?: boolean;
  onRefresh?: () => void;
}) {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const name = useUserStore((s) => s.name || s.nickName);

  return (
    <header className="base-header" style={{
      height: 52,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      borderBottom: '1px solid var(--ku-border-color, #e5e0d8)',
      background: 'var(--ku-bg-elevated, #fff)',
      flexShrink: 0,
    }}>
      <Space size="middle">
        <Link to="/example" style={{ fontWeight: 600, color: 'var(--ku-text-primary)' }}>
          kr-admin
        </Link>
        {HeaderExampleTab ? <HeaderExampleTab /> : null}
      </Space>
      <Space>
        {hasUpdate ? (
          <Button type="link" icon={<ReloadOutlined />} onClick={onRefresh}>
            有新版本，点击刷新
          </Button>
        ) : null}
        <Button
          type="text"
          icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        />
        <Tag>{name || '用户'}</Tag>
        <Button type="link" onClick={() => void submitLogout()}>
          退出
        </Button>
      </Space>
    </header>
  );
}
`,
);

write(
  'layouts/HeaderExampleTab.tsx',
  `import { Tag } from 'antd';
import { Link, useLocation } from 'react-router-dom';

export default function HeaderExampleTab() {
  const loc = useLocation();
  const active = loc.pathname.startsWith('/example');
  return (
    <Link to="/example">
      <Tag color={active ? 'processing' : 'default'}>示例管理</Tag>
    </Link>
  );
}
`,
);

write(
  'layouts/headerExampleTabEntry.ts',
  `export { default } from './HeaderExampleTab';
`,
);

write(
  'stubs/emptyExampleNavTab.ts',
  `export default null;
`,
);

// ——— views ———
write(
  'views/ErrorPage.tsx',
  `export default function ErrorPage({ code }: { code?: string | number | null }) {
  return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <h2>页面异常</h2>
      <p>资源加载失败或服务异常{code != null ? \`（\${code}）\` : ''}</p>
    </div>
  );
}
`,
);

write(
  'views/LoggedOut.tsx',
  `export default function LoggedOut() {
  return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <h2>已退出登录</h2>
      <p>如需继续使用，请重新登录。</p>
    </div>
  );
}
`,
);

write(
  'views/AccountException.tsx',
  `import { useUserStore } from '@/stores/user';

export default function AccountException() {
  const denied = useUserStore((s) => s.accessDenied);
  return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <h2>账号异常或无权限</h2>
      <p>{denied?.detail || '当前账号无法访问本系统'}</p>
      {denied?.code != null ? <p>错误码：{String(denied.code)}</p> : null}
    </div>
  );
}
`,
);

write(
  'views/ComingSoonLayer.tsx',
  `export default function ComingSoonLayer({ title = '敬请期待' }: { title?: string }) {
  return (
    <div style={{ padding: 24 }}>
      <p>{title}</p>
    </div>
  );
}
`,
);

console.log('shell parts written');
