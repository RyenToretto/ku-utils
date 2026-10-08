import { LockOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { MODULE_PERMISSION_KEYS } from '@/maps/common/dspPermission';
import { message } from '@/plugins/antdApp';
import { submitLogout } from '@/plugins/axios';
import { resolveBusinessHomePath } from '@/router/paths';
import { useUserStore } from '@/stores/user';
import AuthStatusShell from '@/views/AuthStatusShell';

export default function AccountException() {
  const navigate = useNavigate();
  const accessDenied = useUserStore((s) => s.accessDenied);
  const fetchUserInfo = useUserStore((s) => s.fetchUserInfo);
  const hasPermission = useUserStore((s) => s.hasPermission);
  const markNoPermissionDenied = useUserStore((s) => s.markNoPermissionDenied);
  const clearSession = useUserStore((s) => s.clearSession);
  const [retryLoading, setRetryLoading] = useState(false);
  const [switchLoading, setSwitchLoading] = useState(false);

  const codeLabel =
    accessDenied?.code === undefined || accessDenied?.code === null || accessDenied?.code === ''
      ? ''
      : String(accessDenied.code);
  const detailLabel = accessDenied?.detail || '';

  async function handleRetry() {
    setRetryLoading(true);
    try {
      await fetchUserInfo();
      const ok = MODULE_PERMISSION_KEYS.some((key) => hasPermission(key));
      if (!ok) {
        markNoPermissionDenied();
        message.warning('当前账号仍无功能权限');
        return;
      }
      void navigate(resolveBusinessHomePath(), { replace: true });
    } catch {
      message.error('刷新账号状态失败');
    } finally {
      setRetryLoading(false);
    }
  }

  function handleSwitchAccount() {
    setSwitchLoading(true);
    clearSession();
    submitLogout('login');
  }

  return (
    <AuthStatusShell
      titleId="account-exception-title"
      iconTone="warning"
      role="alert"
      icon={<LockOutlined style={{ fontSize: 32 }} />}
      title="账号异常或无权限"
      desc="登录已成功，但当前账号异常、尚未开通或缺少投放权限。可重试刷新状态，或切换其他账号。"
      meta={
        codeLabel || detailLabel ? (
          <p className="page-account-exception-meta">
            {codeLabel ? (
              <span className="page-account-exception-chip">异常码 {codeLabel}</span>
            ) : null}
            {detailLabel ? (
              <span className="page-account-exception-chip-detail">{detailLabel}</span>
            ) : null}
          </p>
        ) : null
      }
      actions={
        <>
          <Button
            type="primary"
            loading={retryLoading}
            disabled={switchLoading}
            onClick={handleRetry}
          >
            重试
          </Button>
          <Button
            loading={switchLoading}
            disabled={retryLoading}
            onClick={handleSwitchAccount}
          >
            切换账号
          </Button>
        </>
      }
    />
  );
}
