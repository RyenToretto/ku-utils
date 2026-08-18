import type { MacroTuple } from './types';

/**
 * 通用宏替换引擎：将模板中的占位符替换为 pMaps 中的值
 */
export function replaceMacros(
  template: string,
  macros: MacroTuple[],
  pMaps: Record<string, string>,
): string {
  let result = template;
  for (const [macro, key, defaultValue] of macros) {
    result = result.replace(macro, pMaps[key] || defaultValue || '');
  }
  return result;
}

export const FB_CAMPAIGN_FRAGMENT =
  'adj_campaign={{campaign.name}}%20%28{{campaign.id}}%29' +
  '&adj_adgroup={{adset.name}}%20%28{{adset.id}}%29' +
  '&adj_creative={{ad.name}}%20%28{{ad.id}}%29' +
  '&fbclid={{fbclid}}&adj_label={{adj_label}}';

export const FB_CAMPAIGN_MACROS: MacroTuple[] = [
  ['{{campaign.name}}', 'campaign'],
  ['{{campaign.id}}', 'campaign_id'],
  ['{{adset.name}}', 'adgroup'],
  ['{{adset.id}}', 'adset_id'],
  ['{{ad.name}}', 'ad'],
  ['{{ad.id}}', 'ad_id'],
  ['{{adj_label}}', 'psi'],
  ['{{fbclid}}', 'fbclid'],
];

export const DEFAULT_TIKTOK_MACROS: MacroTuple[] = [
  ['__CAMPAIGN__', 'campaign'],
  ['__CAMPAIGN_ID__', 'campaign_id'],
  ['__ADGROUP__', 'adgroup'],
  ['__AID__', 'adgroup_id'],
  ['__CREATIVE__', 'creative'],
  ['__CID__', 'creative_id'],
  ['__IDFA__', 'idfa'],
  ['__callback_param__', 'ttclid'],
  ['__GAID__', 'gps_adid'],
  ['__IP__', 'ip_address'],
  ['__PLACEMENT__', 'tiktok_placement'],
  ['__LABEL__', 'psi'],
  ['__S2S__', 's2s', '1'],
  ['__EXTERNAL_TRACKER_IDS__', 'external_tracker_ids'],
  ['__TRACKER_LIMIT__', 'tracker_limit', '25000'],
  ['__ENGAGEMENT_TYPE__', 'engagement_type', 'fallback_click'],
];
