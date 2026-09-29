import { Empty } from 'antd';
import { useMatches } from 'react-router-dom';

import type { AppRouteHandle } from '@/types/routeHandle';

export default function ComingSoonLayer() {
  const matches = useMatches();
  const handle = (matches[matches.length - 1]?.handle || {}) as AppRouteHandle;
  const title = String(handle.title || '功能');
  const permission = String(handle.permission || '');
  const owner = '待认领';

  return (
    <div className="page-coming-soon">
      <Empty
        description={`${title} · 页面建设中，欢迎认领开发`}
        image={
          <div
            className="page-coming-soon-badge"
            style={{ margin: '0 auto' }}
          >
            Coming Soon
          </div>
        }
      >
        <div className="page-coming-soon-meta">
          {permission ? (
            <p>
              权限 Key：<code>{permission}</code>
            </p>
          ) : null}
          <p>
            负责人：<strong>{owner}</strong>
          </p>
        </div>
      </Empty>
    </div>
  );
}
