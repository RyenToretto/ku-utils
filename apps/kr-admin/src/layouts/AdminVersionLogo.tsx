import { doEnv } from '@/utils/env';

export function AdminVersionLogo({
  hasUpdate,
  onRefresh,
}: {
  hasUpdate?: boolean;
  onRefresh?: () => void;
}) {
  return (
    <div className="admin-version-logo">
      <span
        className="admin-version-logo-mark"
        aria-hidden
      >
        ◆
      </span>
      <span className="admin-version-logo-name">{doEnv.VITE_APP_PROJECT_NAME}</span>
      {hasUpdate ? (
        <button
          type="button"
          className="admin-version-logo-update"
          onClick={onRefresh}
        >
          有更新，点击刷新
        </button>
      ) : null}
    </div>
  );
}

export default AdminVersionLogo;
