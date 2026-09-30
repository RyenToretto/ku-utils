import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import SideMenu, { type SideMenuNode } from '@/layouts/sideMenu';

function firstLeafPath(node: string | SideMenuNode | undefined): string | undefined {
  if (!node) return undefined;
  if (typeof node === 'string') return node;
  if (node.children?.length) return firstLeafPath(node.children[0]);
  return node.path;
}

export type DomainModuleShellProps = {
  menus: SideMenuNode[];
  moduleRootPath: string;
};

export function DomainModuleShell({ menus, moduleRootPath }: DomainModuleShellProps) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const leaf = firstLeafPath(menus[0]);
    if (leaf && location.pathname === moduleRootPath) {
      void navigate(leaf, { replace: true });
    }
  }, [location.pathname, menus, moduleRootPath, navigate]);

  return (
    <main
      className="domain-module-shell"
      style={{
        display: 'flex',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        background: 'transparent',
      }}
    >
      <aside
        className="domain-module-aside sidebar-nav"
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: '1px solid var(--ku-border-color-sidebar, transparent)',
          background: 'var(--ku-bg-sidebar, #2f2a26)',
          overflow: 'auto',
        }}
      >
        <div className="domain-module-aside-body">
          <SideMenu
            menus={menus}
            moduleRootPath={moduleRootPath}
          />
        </div>
      </aside>
      <div
        className="domain-module-main"
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          padding: 20,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <Outlet />
      </div>
    </main>
  );
}

export default DomainModuleShell;
