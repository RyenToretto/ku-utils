import { ArrowRightOutlined, LogoutOutlined, SunOutlined } from '@ant-design/icons';
import { Avatar, Popover } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';

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
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const pendingThemeRef = useRef<ThemeMode | null>(null);

  const appearanceLabel = useMemo(() => THEME_LABELS[theme] || THEME_LABELS.system, [theme]);

  /** 两个弹层都关闭后再切主题，避免 html.dark 导致 Ant Popover 门户残留 */
  useEffect(() => {
    if (profileOpen || appearanceOpen || !pendingThemeRef.current) return;
    const mode = pendingThemeRef.current;
    pendingThemeRef.current = null;
    onSetTheme(mode);
  }, [profileOpen, appearanceOpen, onSetTheme]);

  const closeAll = () => {
    setAppearanceOpen(false);
    setProfileOpen(false);
  };

  const handleSetTheme = (mode: ThemeMode) => {
    pendingThemeRef.current = mode;
    setAppearanceOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = () => {
    pendingThemeRef.current = null;
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

      <Popover
        open={appearanceOpen}
        onOpenChange={setAppearanceOpen}
        trigger="click"
        placement="leftTop"
        arrow={false}
        destroyOnHidden
        zIndex={1200}
        getPopupContainer={() => document.body}
        overlayClassName="appearance-menu-popover"
        content={
          <AppearancePicker
            value={theme}
            onChange={handleSetTheme}
          />
        }
      >
        <button
          type="button"
          className="profile-menu-item is-appearance"
        >
          <SunOutlined />
          <span>外观</span>
          <span className="profile-menu-item-value">{appearanceLabel}</span>
          <ArrowRightOutlined className="profile-menu-item-arrow" />
        </button>
      </Popover>

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
          if (!open) setAppearanceOpen(false);
        }}
        trigger="click"
        placement="bottomRight"
        arrow={false}
        destroyOnHidden
        zIndex={1100}
        getPopupContainer={() => document.body}
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
