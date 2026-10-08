import tome from '@ku-utils/skin/tokens';
import { theme as antTheme, type ThemeConfig } from 'antd';

type MappingAlgorithm = NonNullable<
  Extract<ThemeConfig['algorithm'], (...args: never[]) => unknown>
>;

/**
 * tome 皮肤 → antd ThemeConfig。
 * antd 用真实色值派生 hover/active 等色阶，所以吃 `@ku-utils/skin/tokens` 的已解析值，
 * 不能写 var(--ku-*)；明暗由调用方按 html.dark 同步切换。
 */
export function createAntdTheme(isDark: boolean): ThemeConfig {
  const ku = isDark ? tome.dark : tome.light;

  // 暗色算法会把种子色往暗底混一档；品牌/状态色以皮肤原值为准（与 kv3 一致）
  const pinSkinColors: MappingAlgorithm = (_seed, map) => ({
    ...map!,
    colorPrimary: ku['color-primary'],
    colorPrimaryHover: ku['color-primary-hover'],
    colorSuccess: ku['color-success'],
    colorWarning: ku['color-warning'],
    colorError: ku['color-danger'],
    colorInfo: ku['color-info'],
  });

  return {
    algorithm: [isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm, pinSkinColors],
    token: {
      colorPrimary: ku['color-primary'],
      colorSuccess: ku['color-success'],
      colorWarning: ku['color-warning'],
      colorError: ku['color-danger'],
      colorInfo: ku['color-info'],
      colorLink: ku['text-link'],
      colorLinkHover: ku['text-link-hover'],
      colorText: ku['text-primary'],
      colorTextHeading: ku['text-primary'],
      colorTextSecondary: ku['text-secondary'],
      colorTextTertiary: ku['text-placeholder'],
      colorTextPlaceholder: ku['text-placeholder'],
      colorTextDisabled: ku['text-disabled'],
      colorTextLightSolid: ku['text-on-primary'],
      colorBorder: ku['border-default'],
      colorBorderSecondary: ku['border-light'],
      colorSplit: ku.divider,
      colorBgContainer: ku['bg-card'],
      colorBgElevated: ku['bg-card-elevated'],
      colorBgLayout: ku['bg-page-from'],
      colorBgMask: ku['bg-overlay'],
      colorBgSpotlight: ku['bg-tooltip'],
      borderRadius: 6,
    },
    components: {
      // 对齐 kv3 el-card：标题常规字重、18/20 内边距、4px 圆角；default / small 同尺寸
      Card: {
        headerHeight: 54,
        headerHeightSM: 54,
        headerPadding: 20,
        headerPaddingSM: 20,
        headerFontSize: 14,
        headerFontSizeSM: 14,
        bodyPadding: 20,
        bodyPaddingSM: 20,
        fontWeightStrong: 400,
        borderRadiusLG: 4,
      },
      Table: {
        colorText: ku['text-secondary'],
        headerBg: ku['bg-card'],
        headerColor: ku['text-primary'],
        headerSplitColor: 'transparent',
        borderColor: ku['border-light'],
        rowHoverBg: ku['bg-hover'],
        rowSelectedBg: ku['color-primary-bg'],
        rowSelectedHoverBg: ku['bg-hover'],
        cellPaddingBlockMD: 8,
        cellPaddingInlineMD: 8,
      },
    },
  };
}
