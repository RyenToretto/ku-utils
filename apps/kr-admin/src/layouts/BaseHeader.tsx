import ExampleNavTab from '@header-example-tab';
import { Dropdown, theme as antdTheme } from 'antd';
import type { MenuProps } from 'antd';
import { Link } from 'react-router-dom';

import AdminVersionLogo from '@/layouts/AdminVersionLogo';
import { submitLogout } from '@/plugins/axios';
import { useAppStore } from '@/stores/app';
import { useUserStore } from '@/stores/user';
import type { ThemeMode } from '@/utils/theme';

function FallbackExampleTab() {
  return (
    <Link
      to="/example"
      className="base-header-link"
    >
      Demo
    </Link>
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
  const { token } = antdTheme.useToken();

  const displayName = nickName || name || '未登录';
  const userInitial = displayName.charAt(0).toUpperCase();
  const userRole = mail || '账户';

  const items: MenuProps['items'] = [
    {
      key: 'theme',
      type: 'group',
      label: '主题',
      children: [
        { key: 'light', label: '浅色', onClick: () => setTheme('light' as ThemeMode) },
        { key: 'dark', label: '深色', onClick: () => setTheme('dark' as ThemeMode) },
        { key: 'system', label: '跟随系统', onClick: () => setTheme('system' as ThemeMode) },
      ],
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: '退出登录',
      onClick: () => submitLogout('logged-out'),
    },
  ];

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
          <span style={{ color: token.colorTextSecondary, fontSize: 12, marginRight: 8 }}>
            主题: {themeMode}
          </span>
          <Dropdown
            menu={{ items }}
            placement="bottomRight"
          >
            <button
              type="button"
              className="base-header-profile"
            >
              <span className="base-header-avatar">{userInitial}</span>
              <span className="base-header-profile-text">
                <strong>{displayName}</strong>
                <small>{userRole}</small>
              </span>
            </button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}

export default BaseHeader;
