import ExampleNavTab from '@header-example-tab';
import { NavLink } from 'react-router-dom';

import HeaderProfileMenu from '@/components/HeaderProfileMenu';
import AdminVersionLogo from '@/layouts/AdminVersionLogo';
import { submitLogout } from '@/plugins/axios';
import { useAppStore } from '@/stores/app';
import { useUserStore } from '@/stores/user';
import type { ThemeMode } from '@/utils/theme';

function FallbackExampleTab() {
  return (
    <NavLink
      to="/example"
      className={({ isActive }) => `base-header-link header-example-tab${isActive ? ' is-active' : ''}`}
    >
      Demo
    </NavLink>
  );
}

export type BaseHeaderProps = {
  hasUpdate?: boolean;
  onRefresh?: () => void;
};

export function BaseHeader({ hasUpdate = false, onRefresh }: BaseHeaderProps) {
  const nickName = useUserStore((s) => s.nickName);
  const name = useUserStore((s) => s.name);
  const mail = useUserStore((s) => s.mail);
  const themeMode = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  const displayName = nickName || name || '未登录';
  const userInitial = displayName.charAt(0).toUpperCase();
  const userRole = mail || '账户';

  const Nav = ExampleNavTab || FallbackExampleTab;

  return (
    <header className="base-header">
      <div className="base-header-inner">
        <AdminVersionLogo
          hasUpdate={hasUpdate}
          onRefresh={onRefresh}
        />
        <nav className="base-header-menus">
          <Nav />
        </nav>
        <div className="base-header-right">
          <HeaderProfileMenu
            initial={userInitial}
            displayName={displayName}
            role={userRole}
            theme={themeMode}
            onLogout={() => submitLogout('logged-out')}
            onSetTheme={(mode) => setTheme(mode as ThemeMode)}
          />
        </div>
      </div>
    </header>
  );
}

export default BaseHeader;
