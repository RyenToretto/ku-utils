import type { RouteRecordRaw } from 'vue-router';

export type ComingSoonLeaf = {
  path: string;
  name: string;
  title: string;
  permission: string;
  docsPath: string;
  owner?: string;
  backendReady?: boolean;
};

/**
 * 将尚未落地的侧栏叶子映射为 ComingSoon 路由。
 *
 * 某叶子改为真实业务页时：从 `leaves` 移除该项，在域 `children` 中改为显式
 * `component: () => import('.../*Layer.vue')`，再对剩余叶子继续调用本函数。
 * 完整步骤见 `docs/guides/admin-list-page-pattern.md` §4。
 */
export function buildComingSoonChildren(leaves: ComingSoonLeaf[]): RouteRecordRaw[] {
  return leaves.map((leaf) => ({
    path: leaf.path.replace(/^\//, '').split('/').slice(1).join('/'),
    name: leaf.name,
    meta: {
      title: leaf.title,
      permission: leaf.permission,
      docsPath: leaf.docsPath,
      owner: leaf.owner || '待认领',
      backendReady: leaf.backendReady !== false,
    },
    component: () => import('@/views/ComingSoonLayer.vue'),
  }));
}
