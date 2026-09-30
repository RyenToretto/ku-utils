import BrandLogoMark from '@/components/BrandLogoMark';
import { doEnv } from '@/utils/env';

export function AdminVersionLogo({
  hasUpdate = false,
  onRefresh,
}: {
  hasUpdate?: boolean;
  onRefresh?: () => void;
}) {
  const projectName = doEnv.VITE_APP_PROJECT_NAME || 'kr-admin';
  const label = projectName.replace(/-/g, ' ');

  const inner = (
    <span className="logo-icon-wrap">
      <BrandLogoMark className="logo-mark" />
      <span className="logo-text">{label}</span>
      {hasUpdate ? (
        <span
          className="logo-update-badge"
          role="status"
        >
          <span
            className="logo-update-dot"
            aria-hidden
          />
          新版本
        </span>
      ) : null}
    </span>
  );

  if (hasUpdate) {
    return (
      <button
        type="button"
        className="admin-version-logo has-update"
        title="发现新版本，点击刷新页面"
        aria-label="发现新版本，点击刷新页面"
        onClick={onRefresh}
      >
        {inner}
      </button>
    );
  }

  return (
    <div
      className="admin-version-logo"
      title={projectName}
    >
      {inner}
    </div>
  );
}

export default AdminVersionLogo;
