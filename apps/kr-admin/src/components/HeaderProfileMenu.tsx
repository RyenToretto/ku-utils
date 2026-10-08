import { ArrowRightOutlined, LogoutOutlined, SunOutlined } from '@ant-design/icons';
import { Avatar, ConfigProvider, Popover } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';

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

type AnchorRect = { top: number; left: number; width: number; height: number };

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
  const [anchor, setAnchor] = useState<AnchorRect | null>(null);
  const appearanceRef = useRef<HTMLDivElement | null>(null);
  const appearanceBtnRef = useRef<HTMLButtonElement | null>(null);

  const appearanceLabel = useMemo(() => THEME_LABELS[theme] || THEME_LABELS.system, [theme]);

  const closeAppearance = () => {
    setAppearanceOpen(false);
    setAnchor(null);
  };

  /** 与 kv3 closeMenus 对齐：同步瞬时收起两层（避免 Ant 离场动画造成卡顿） */
  const closeMenus = () => {
    flushSync(() => {
      closeAppearance();
      setProfileOpen(false);
    });
  };

  const handleSetTheme = (mode: ThemeMode) => {
    // 先切肤再卸层：真实鼠标 mousedown 会被账户 Popover 当成外部点击，
    // 若先 unload 外观层，click 阶段的 onChange 可能根本跑不到
    onSetTheme(mode);
    closeMenus();
  };

  const handleLogout = () => {
    closeMenus();
    onLogout();
  };

  const openAppearance = () => {
    const el = appearanceBtnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setAnchor({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
    setAppearanceOpen(true);
  };

  useEffect(() => {
    if (!appearanceOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (appearanceRef.current?.contains(target)) return;
      if (appearanceBtnRef.current?.contains(target)) return;
      closeAppearance();
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [appearanceOpen]);

  const appearancePanel =
    appearanceOpen &&
    anchor &&
    createPortal(
      <div
        ref={appearanceRef}
        className="appearance-menu-popover-portal"
        style={{
          position: 'fixed',
          top: anchor.top,
          left: Math.max(8, anchor.left - 168),
          width: 160,
          zIndex: 1200,
        }}
        role="dialog"
        aria-label="外观"
        /* 阻止冒泡到 document，避免 Ant Popover 把侧栏点击当成「外部」先关掉 */
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="appearance-menu-popover-inner">
          <AppearancePicker
            value={theme}
            onChange={handleSetTheme}
          />
        </div>
      </div>,
      document.body,
    );

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
        ref={appearanceBtnRef}
        type="button"
        className={`profile-menu-item is-appearance${appearanceOpen ? ' is-active' : ''}`}
        onClick={openAppearance}
      >
        <SunOutlined />
        <span>外观</span>
        <span className="profile-menu-item-value">{appearanceLabel}</span>
        <ArrowRightOutlined className="profile-menu-item-arrow" />
      </button>

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
      {/* 局部关 motion：选主题时与切肤同步瞬时卸层，避免 zoom-big 离场卡顿 */}
      <ConfigProvider theme={{ token: { motion: false } }}>
        <Popover
          open={profileOpen}
          onOpenChange={(open) => {
            setProfileOpen(open);
            if (!open) closeAppearance();
          }}
          trigger="click"
          placement="bottomRight"
          arrow={false}
          zIndex={1100}
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
          destroyOnHidden
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
      </ConfigProvider>
      {appearancePanel}
    </div>
  );
}
