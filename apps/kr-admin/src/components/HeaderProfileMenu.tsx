import { ArrowRightOutlined, LogoutOutlined, SunOutlined } from '@ant-design/icons';
import { Avatar, Popover } from 'antd';
import { useMemo, useState } from 'react';

import AppearancePicker from '@/components/AppearancePicker';
import type { ThemeMode } from '@/utils/theme';

export type HeaderProfileMenuProps = {
  initial: string;
  displayName: string;
  role: string;
  theme: ThemeMode;
  onLogout: () => void;
  onSetTheme: (mode: ThemeMode) => void;
};

const THEME_LABELS: Record<ThemeMode, string> = {
  light: '浅色',
  dark: '深色',
  system: '跟随系统',
};

export default function HeaderProfileMenu({
  initial,
  displayName,
  role,
  theme,
  onLogout,
  onSetTheme,
}: HeaderProfileMenuProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [appearanceExpanded, setAppearanceExpanded] = useState(false);

  const appearanceLabel = useMemo(() => THEME_LABELS[theme] || THEME_LABELS.system, [theme]);

  const closeAll = () => {
    setAppearanceExpanded(false);
    setProfileOpen(false);
  };

  const handleSetTheme = (mode: ThemeMode) => {
    // 先关弹层再切主题，避免 html.dark 切换时 Ant Popover 门户残留
    setAppearanceExpanded(false);
    setProfileOpen(false);
    window.setTimeout(() => onSetTheme(mode), 0);
  };

  const handleLogout = () => {
    closeAll();
    onLogout();
  };

  const menu = (
    <div className="profile-menu">
      <div className="profile-menu-hd">
        <Avatar
          size={38}
          className="profile-menu-avatar profile-avatar"
        >
          {initial}
        </Avatar>
        <div className="profile-menu-meta">
          <span className="profile-menu-name">{displayName}</span>
          <span className="profile-menu-role">{role}</span>
        </div>
      </div>

      <div className="profile-menu-divider" />

      <button
        type="button"
        className={`profile-menu-item is-appearance${appearanceExpanded ? ' is-expanded' : ''}`}
        onClick={() => setAppearanceExpanded((v) => !v)}
      >
        <SunOutlined />
        <span>外观</span>
        <span className="profile-menu-item-value">{appearanceLabel}</span>
        <ArrowRightOutlined
          className="profile-menu-item-arrow"
          style={{ transform: appearanceExpanded ? 'rotate(90deg)' : undefined }}
        />
      </button>

      {appearanceExpanded ? (
        <div className="profile-menu-appearance-panel">
          <AppearancePicker
            value={theme}
            onChange={handleSetTheme}
          />
        </div>
      ) : null}

      <button
        type="button"
        className="profile-menu-item"
        onClick={handleLogout}
      >
        <LogoutOutlined />
        <span>退出登录</span>
      </button>
    </div>
  );

  return (
    <div className="header-profile">
      <Popover
        open={profileOpen}
        onOpenChange={(open) => {
          setProfileOpen(open);
          if (!open) setAppearanceExpanded(false);
        }}
        trigger="click"
        placement="bottomRight"
        arrow={false}
        destroyOnHidden
        overlayClassName="profile-menu-popover"
        content={menu}
      >
        <button
          type="button"
          className="profile-avatar-btn header-profile-trigger"
          aria-label="打开账户菜单"
        >
          <Avatar
            size={36}
            className="profile-avatar"
          >
            {initial}
          </Avatar>
        </button>
      </Popover>
    </div>
  );
}
