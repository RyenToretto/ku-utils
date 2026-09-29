import { Breadcrumb, Card, Typography } from 'antd';
import { useMatches } from 'react-router-dom';

import type { AppRouteHandle } from '@/types/routeHandle';

export default function NestMenusLayer() {
  const matches = useMatches();
  const handle = (matches[matches.length - 1]?.handle || {}) as AppRouteHandle;
  const trail = handle.nestTrail || [handle.title || '页面'];

  return (
    <div className="page-nest-menus">
      <Breadcrumb
        items={trail.map((t) => ({ title: t }))}
        style={{ marginBottom: 16 }}
      />
      <Card>
        <Typography.Title
          level={4}
          style={{ marginTop: 0 }}
        >
          {handle.title || '多级导航叶子'}
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          本页用于验证侧栏多级展开与路由叶子标题同步。当前层级：{handle.nestLevel ?? trail.length}
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
