import type { RouteConfig as RouteRecordRaw } from 'vue-router';

/**
 * ComingSoon 子路由工厂（与 kv3 同形）。
 */
export function buildComingSoonChildren(
  items: Array<{ path: string; name: string; title?: string }>,
): RouteRecordRaw[] {
  return items.map((item) => ({
    path: item.path,
    name: item.name,
    component: () => import('@/views/ComingSoonLayer.vue'),
    meta: { title: item.title || item.name },
  }));
}
