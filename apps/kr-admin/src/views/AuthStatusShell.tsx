import { Button } from 'antd';
import type { ReactNode } from 'react';

import { doEnv } from '@/utils/env';

export type AuthStatusShellProps = {
  titleId: string;
  iconTone?: 'warning' | 'success' | 'danger' | 'info';
  role?: React.AriaRole;
  icon?: ReactNode;
  title: ReactNode;
  desc?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
};

export function AuthStatusShell({
  titleId,
  iconTone = 'info',
  role = 'status',
  icon,
  title,
  desc,
  meta,
  actions,
}: AuthStatusShellProps) {
  return (
    <main className="page-auth-status">
      <div
        className="page-auth-status-atmosphere"
        aria-hidden
      />
      <section
        className={`page-auth-status-panel tone-${iconTone}`}
        role={role}
        aria-labelledby={titleId}
      >
        <header className="page-auth-status-brand">
          <span className="page-auth-status-mark">◆</span>
          <div className="page-auth-status-brand-text">
            <span className="page-auth-status-brand-name">{doEnv.VITE_APP_PROJECT_NAME}</span>
            <span className="page-auth-status-brand-sub">投放工作台</span>
          </div>
        </header>
        <div
          className={`page-auth-status-icon tone-${iconTone}`}
          aria-hidden
        >
          {icon}
        </div>
        <h1
          id={titleId}
          className="page-auth-status-title"
        >
          {title}
        </h1>
        {desc ? <p className="page-auth-status-desc">{desc}</p> : null}
        {meta}
        <div className="page-auth-status-actions">{actions}</div>
        <p className="page-auth-status-hint">会话由统一认证托管，本系统不保存登录口令</p>
      </section>
    </main>
  );
}

export function AccountAccessTip({
  title,
  description,
  code,
}: {
  title: string;
  description: string;
  code?: string | number | null;
}) {
  return (
    <AuthStatusShell
      titleId="account-access-tip"
      iconTone="danger"
      title={title}
      desc={description}
      meta={
        code != null && code !== '' ? (
          <p className="page-account-exception-meta">
            <span className="page-account-exception-chip">异常码 {String(code)}</span>
          </p>
        ) : null
      }
      actions={
        <Button
          type="primary"
          onClick={() => window.location.reload()}
        >
          刷新页面
        </Button>
      }
    />
  );
}

export default AuthStatusShell;
