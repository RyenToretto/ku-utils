import type { AppsflyerConfig, AppsflyerTracker } from './types';

/**
 * 从 psi 中提取 link_id（第一个 '_' 前的部分）
 */
function extractLinkId(psi: string): string {
  if (!psi) return '';
  const idx = psi.indexOf('_');
  return idx > 0 ? psi.substring(0, idx) : psi;
}

const DEFAULT_SUB_MAP: Record<string, string> = {
  sub1: 'bookid',
  sub2: 'chapter_id',
  sub3: 'campaign',
  sub4: 'lang',
  sub5: 'rate',
  sub6: 'page_id',
  sub8: 'psi',
};

/**
 * 创建 Appsflyer OneLink 归因追踪器（工厂函数）
 *
 * @example
 *   const af = createAppsflyerTracker({
 *     oneLinkBase: 'https://novelsofa.onelink.me/x0gG/9rz10tu2',
 *     appScheme: 'novelsofa://mainActivity',
 *   })
 *   af.redirect(pMaps)
 */
export function createAppsflyerTracker(config: AppsflyerConfig): AppsflyerTracker {
  const { oneLinkBase, pid = 'metaweb_int', appScheme, linkIdSource = 'psi' } = config;

  const subMap = { ...DEFAULT_SUB_MAP, ...config.deepLinkSubMap };

  function buildOneLinkUrl(
    pMaps: Record<string, string>,
    extra: Record<string, string> = {},
  ): string {
    const linkId = linkIdSource === 'psi' ? extractLinkId(pMaps.psi || '') : pMaps.link_id || '';

    const params = new URLSearchParams();

    params.set('pid', pid);
    params.set('deep_link_value', linkId);
    params.set('af_dp', encodeURIComponent(appScheme));

    for (const [subKey, paramName] of Object.entries(subMap)) {
      const value = pMaps[paramName];
      if (value) {
        params.set(`deep_link_${subKey}`, value);
      }
    }

    if (pMaps.customer_user_id || pMaps.user_id) {
      params.set('customer_user_id', pMaps.customer_user_id || pMaps.user_id || '');
    }

    if (pMaps.fbclid) {
      params.set('fbclid', pMaps.fbclid);
    }

    params.set('af_ss_ui', 'true');
    params.set('af_force_deeplink', 'true');

    for (const [k, v] of Object.entries(extra)) {
      params.set(k, v);
    }

    const joiner = oneLinkBase.includes('?') ? '&' : '?';
    return `${oneLinkBase}${joiner}${params.toString()}`;
  }

  function redirect(pMaps: Record<string, string>, isDebugger = -1): void {
    const url = buildOneLinkUrl(pMaps);

    if (+isDebugger === 1) {
      // eslint-disable-next-line no-console
      console.log('[Appsflyer OneLink]', url);
      return;
    }

    window.location.href = url;
  }

  return { buildOneLinkUrl, redirect };
}
