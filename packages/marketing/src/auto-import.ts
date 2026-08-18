/**
 * auto-import preset 类型定义
 * ⚠️ 不要从 'unplugin-auto-import/types' 引入 ImportsMap —— 该依赖属于消费方项目，
 *    本库不应依赖它。此处直接内联等价类型即可。
 */
type ImportsMap = Record<string, (string | string[])[]>;

/**
 * 由 scripts/generate-auto-import.mjs 自动生成，勿手动编辑。
 * 共 28 个命名导出。
 */
export const kuUtilsMarketingImports: ImportsMap = {
  '@ku-utils/marketing': [
    'appAndDownload',
    'buildAdjDeepLink',
    'copyAdjDeepLink',
    'createAdjustTracker',
    'createAdjustWebAdapter',
    'createAppsflyerTracker',
    'createBootstrapScript',
    'createFacebookPixelAdapter',
    'createPairedTracker',
    'createPixelScripts',
    'createSmartScriptTag',
    'createTiktokPixelAdapter',
    'DEFAULT_TIKTOK_MACROS',
    'FB_CAMPAIGN_FRAGMENT',
    'FB_CAMPAIGN_MACROS',
    'getDeviceToken',
    'getFbp',
    'getLandingParams',
    'getPkg',
    'isContainMatchPage',
    'isFramePage',
    'isMatchPage',
    'isPricingPage',
    'isTiktok',
    'lighten',
    'makeDownload',
    'replaceMacros',
    'startDownload',
  ],
};

export const kuUtilsMarketingPreset = kuUtilsMarketingImports;
