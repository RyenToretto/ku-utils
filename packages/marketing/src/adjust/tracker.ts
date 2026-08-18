import { appendUrlParams, encodeShiftHex, isAndroid, setCopy } from '@ku-utils/utils';

import { getDeviceToken, getFbp, isTiktok } from '../landing/runtime';

import {
  DEFAULT_TIKTOK_MACROS,
  FB_CAMPAIGN_FRAGMENT,
  FB_CAMPAIGN_MACROS,
  replaceMacros,
} from './macros';
import type { AdjustConfig, AdjustTracker, MacroTuple } from './types';

const DEFAULTS = {
  impressionBase: 'https://view.adjust.com/impression',
  goLinkBase: 'https://novelsofa.go.link',
};

function buildDeepLink(
  pMaps: Record<string, string>,
  schemes: AdjustConfig['schemes'],
  obj: Record<string, any> = {},
): string {
  if (pMaps.adj_deep_link) return pMaps.adj_deep_link;
  const scheme = isAndroid() ? schemes.android : schemes.ios;
  const baseQuery: Record<string, string> = {
    psi: pMaps.psi || '',
    bookid: pMaps.bookid || '',
  };
  if (pMaps.biz_type) {
    baseQuery.biz_type = pMaps.biz_type;
  }
  return appendUrlParams(`${scheme}`, { ...baseQuery, ...obj });
}

function resolveAdjDeepLinkParams(
  pMaps: Record<string, string>,
  config: Pick<AdjustConfig, 'facebook'>,
): Record<string, string> {
  return {
    fb_pixel_id: config.facebook?.pixelId || pMaps.fb_pixel_id || '',
    fbclid: pMaps.fbclid || pMaps._fbc || '',
    external_device_id: getDeviceToken(),
    fbp: getFbp(),
  };
}

/** 构建含 psi/bookid[/biz_type]/fb_pixel_id/fbclid/external_device_id/fbp 的 adj_deep_link */
export function buildAdjDeepLink(
  pMaps: Record<string, string>,
  config: Pick<AdjustConfig, 'schemes' | 'facebook'>,
): string {
  return buildDeepLink(pMaps, config.schemes, resolveAdjDeepLinkParams(pMaps, config));
}

/** 将 adj_deep_link 按位移十六进制编码后写入剪贴板 */
export async function copyAdjDeepLink(
  pMaps: Record<string, string>,
  config: Pick<AdjustConfig, 'schemes' | 'facebook'>,
  isDebugger = -1,
): Promise<string> {
  const deepLink = buildAdjDeepLink(pMaps, config);
  const encoded = encodeShiftHex(deepLink);

  if (+isDebugger === 1) {
    // eslint-disable-next-line no-console
    console.log('adj_deep_link:', deepLink);
    // eslint-disable-next-line no-console
    console.log('clipboard:', encoded);
    return encoded;
  }

  await setCopy(encoded);
  return encoded;
}

function appendFacebookParams(config: AdjustConfig): { params: MacroTuple[]; pathStr: string } {
  const fb = config.facebook;
  if (fb?.accessToken) {
    return {
      params: [],
      pathStr: `&fb_pixel_id=${fb.pixelId || ''}&fb_access_token=${fb.accessToken}`,
    };
  }
  return {
    params: [['{{fbpid}}', 'fbpid']],
    pathStr: '&fbpid={{fbpid}}',
  };
}

function buildFacebookCampaignUrl(
  baseUrl: string,
  pMaps: Record<string, string>,
  config: AdjustConfig,
  suffix = '',
): string {
  const processed = { ...pMaps };
  if (processed._fbc) processed.fbclid = processed._fbc;

  const { params, pathStr } = appendFacebookParams(config);
  const joiner = baseUrl.includes('?') ? '&' : '?';
  const template = `${baseUrl}${joiner}${FB_CAMPAIGN_FRAGMENT}${suffix}${pathStr}`;
  return replaceMacros(template, [...FB_CAMPAIGN_MACROS, ...params], processed);
}

function buildTiktokTrackerUrl(
  pMaps: Record<string, string>,
  config: AdjustConfig,
  isDebugger: number,
): void {
  const ttToken = pMaps.adj_t || config.tokens.tiktok?.combined || '';
  const goLinkBase = config.goLinkBase || DEFAULTS.goLinkBase;
  const external_device_id = getDeviceToken();
  const fbp = encodeURIComponent(getFbp());
  const deepLink = encodeURIComponent(
    buildDeepLink(pMaps, config.schemes, {
      fbclid: pMaps.fbclid,
      external_device_id,
      fbp,
    }),
  );

  const baseTemplate =
    `${goLinkBase}?adj_t=${ttToken}` +
    '&campaign=__CAMPAIGN__&adgroup=__ADGROUP__&creative=__CREATIVE__' +
    '&idfa=__IDFA__&ttclid=__callback_param__&gps_adid=__GAID__' +
    '&adgroup_id=__AID__&ip_address=__IP__&campaign_id=__CAMPAIGN_ID__' +
    '&creative_id=__CID__&tracker_limit=__TRACKER_LIMIT__' +
    '&tiktok_placement=__PLACEMENT__&external_tracker_ids=__EXTERNAL_TRACKER_IDS__' +
    '&label=__LABEL__&s2s=__S2S__&engagement_type=__ENGAGEMENT_TYPE__' +
    `&adj_deep_link=${deepLink}` +
    `&external_device_id=${external_device_id}${fbp ? `&fbp=${fbp}` : ''}`;

  const macros = (config.tiktokMacros as MacroTuple[]) || DEFAULT_TIKTOK_MACROS;
  const url = replaceMacros(baseTemplate, macros, pMaps);

  if (+isDebugger === 1) {
    // eslint-disable-next-line no-console
    console.log(url);
    return;
  }
  window.location.href = url;
}

/**
 * 创建 Adjust 归因追踪器（工厂函数）
 *
 * 业务层根据当前环境传入对应的 tokens；无独立 tokens 时不应初始化 tracker
 */
export function createAdjustTracker(config: AdjustConfig): AdjustTracker {
  const impressionBase = config.impressionBase || DEFAULTS.impressionBase;
  const goLinkBase = config.goLinkBase || DEFAULTS.goLinkBase;

  function adjustReport(pMaps: Record<string, string> = {}, isDebugger = -1): void {
    if (isTiktok()) return;

    const trackerToken = isAndroid() ? config.tokens.facebook.android : config.tokens.facebook.ios;

    const fbp = getFbp();
    const fbpStr = fbp ? `&fbp=${encodeURIComponent(fbp)}` : '';

    const url = buildFacebookCampaignUrl(
      `${impressionBase}/${trackerToken}`,
      pMaps,
      config,
      `&external_device_id=${getDeviceToken()}${fbpStr}&t=${Date.now()}`,
    );

    if (+isDebugger === 1) {
      // eslint-disable-next-line no-console
      console.log(url);
      return;
    }

    const img = new Image(0, 0);
    img.style.display = 'none';
    img.src = url;
    img.addEventListener('load', () => img.remove(), { once: true });
    img.addEventListener('error', () => img.remove(), { once: true });
    document.body.appendChild(img);
  }

  function buildTrackerUrl(pMaps: Record<string, string> = {}, isDebugger = -1): void {
    if (isTiktok()) {
      buildTiktokTrackerUrl(pMaps, config, isDebugger);
      return;
    }

    const trackerToken = pMaps.adj_t || config.tokens.facebook.combined;
    const external_device_id = getDeviceToken();
    const fbp = encodeURIComponent(getFbp());
    const deepLink = encodeURIComponent(
      buildDeepLink(pMaps, config.schemes, {
        fb_pixel_id: config.facebook?.pixelId,
        fbclid: pMaps.fbclid,
        external_device_id,
        fbp,
      }),
    );
    const fbpStr = fbp ? `&fbp=${fbp}` : '';

    const url = buildFacebookCampaignUrl(
      `${goLinkBase}?adj_t=${trackerToken}`,
      pMaps,
      config,
      `&external_device_id=${external_device_id}${fbpStr}&adj_deep_link=${deepLink}`,
    );

    if (+isDebugger === 1) {
      // eslint-disable-next-line no-console
      console.log(url);
      return;
    }
    window.location.href = url;
  }

  return {
    adjustReport,
    buildTrackerUrl,
    buildAdjDeepLink: (pMaps) => buildAdjDeepLink(pMaps, config),
    copyAdjDeepLink: (pMaps, isDebugger) => copyAdjDeepLink(pMaps, config, isDebugger),
  };
}
