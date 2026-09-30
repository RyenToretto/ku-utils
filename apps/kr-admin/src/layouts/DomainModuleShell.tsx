import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

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
    <main className="domain-module-shell">
      <aside className="domain-module-aside">
        <div className="domain-module-aside-body">
          <SideMenu
            menus={menus}
            moduleRootPath={moduleRootPath}
          />
        </div>
      </aside>
      <div className="domain-module-main">
        <Outlet />
      </div>
    </main>
  );
}

export default DomainModuleShell;
